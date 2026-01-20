// src/app/faq/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Preguntas Frecuentes | Apocaliptyx",
  description: "Encuentra respuestas a las preguntas más comunes sobre Apocaliptyx",
};

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "¿Qué es Apocaliptyx?",
        a: "Apocaliptyx es una plataforma de predicciones donde los usuarios compiten para demostrar su capacidad de anticipar eventos futuros. Usa AP Coins (moneda virtual) para participar en escenarios y ganar recompensas."
      },
      {
        q: "¿Es legal usar Apocaliptyx?",
        a: "Sí. Apocaliptyx utiliza una moneda virtual (AP Coins) que no tiene valor monetario real y no puede ser canjeada por dinero. Es una plataforma de entretenimiento y competencia."
      },
      {
        q: "¿Necesito pagar para usar la plataforma?",
        a: "No. Puedes usar Apocaliptyx completamente gratis. Recibes 1,000 AP Coins al registrarte y puedes obtener más gratis cada día, ganando predicciones, o completando logros."
      },
    ]
  },
  {
    category: "AP Coins",
    questions: [
      {
        q: "¿Qué son los AP Coins?",
        a: "Los AP Coins son la moneda virtual de Apocaliptyx. Se usan para participar en escenarios de predicción. No tienen valor monetario real y no pueden canjearse por dinero."
      },
      {
        q: "¿Cómo obtengo AP Coins gratis?",
        a: "Hay varias formas: bono de bienvenida (1,000 AP), recompensa diaria (50-500 AP), ganar predicciones, completar logros, referir amigos, y participar en eventos especiales."
      },
      {
        q: "¿Puedo comprar AP Coins?",
        a: "Sí, ofrecemos paquetes de AP Coins para quienes deseen más monedas. Los pagos se procesan de forma segura a través de Stripe."
      },
      {
        q: "¿Los AP Coins se pueden reembolsar?",
        a: "No. Las compras de AP Coins son finales. Solo se consideran excepciones en casos de errores técnicos comprobables o cobros duplicados."
      },
    ]
  },
  {
    category: "Escenarios",
    questions: [
      {
        q: "¿Cómo funcionan los escenarios?",
        a: "Un escenario es una predicción sobre un evento futuro con múltiples opciones. Los usuarios apuestan AP Coins a la opción que creen correcta. Cuando el evento se resuelve, quienes acertaron se reparten el pozo."
      },
      {
        q: "¿Puedo crear mis propios escenarios?",
        a: "Sí, cualquier usuario verificado de nivel 2 o superior puede crear escenarios. Deben seguir nuestras reglas de la comunidad y ser verificables."
      },
      {
        q: "¿Qué pasa si un escenario no se puede resolver?",
        a: "Si un escenario no puede resolverse de manera justa, se cancela y todos los AP Coins apostados se devuelven a los participantes."
      },
    ]
  },
  {
    category: "Cuenta y Seguridad",
    questions: [
      {
        q: "¿Cómo protegen mis datos?",
        a: "Usamos encriptación SSL, autenticación segura, y seguimos las mejores prácticas de seguridad. Nunca compartimos tus datos con terceros sin tu consentimiento."
      },
      {
        q: "¿Puedo eliminar mi cuenta?",
        a: "Sí, puedes eliminar tu cuenta en cualquier momento desde Configuración > Cuenta > Eliminar cuenta. Esta acción es irreversible y perderás todos tus AP Coins."
      },
      {
        q: "Olvidé mi contraseña, ¿qué hago?",
        a: "En la página de login, haz clic en '¿Olvidaste tu contraseña?' e ingresa tu email. Recibirás un enlace para crear una nueva contraseña."
      },
    ]
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
          <p className="text-gray-400 text-lg">
            Encuentra respuestas rápidas a las dudas más comunes
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-purple-400 mb-4">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <span className="font-medium text-white pr-4">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 text-gray-400">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">¿No encontraste tu respuesta?</h3>
          <p className="text-gray-400 mb-4">Nuestro equipo de soporte está listo para ayudarte</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/soporte"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </Link>
            <Link
              href="/ayuda"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}