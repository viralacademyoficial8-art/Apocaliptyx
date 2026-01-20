export const dynamic = 'force-dynamic';

// src/app/reportar/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AlertTriangle, Bug, Shield, CreditCard, Users, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Reportar un Problema | Apocaliptyx",
  description: "Reporta bugs, problemas técnicos o contenido inapropiado en Apocaliptyx",
};

const reportTypes = [
  {
    icon: Bug,
    title: "Bug o Error Técnico",
    description: "La aplicación no funciona correctamente, errores de carga, crashes",
    href: "/soporte?type=bug",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  {
    icon: Shield,
    title: "Contenido Inapropiado",
    description: "Escenarios, comentarios o usuarios que violan las reglas",
    href: "/soporte?type=content",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  {
    icon: CreditCard,
    title: "Problema de Pago",
    description: "Cobros incorrectos, AP Coins no recibidos, errores de transacción",
    href: "/soporte?type=payment",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  {
    icon: Users,
    title: "Acoso o Abuso",
    description: "Comportamiento abusivo, acoso, amenazas de otros usuarios",
    href: "/soporte?type=abuse",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Seguridad de Cuenta",
    description: "Acceso no autorizado, cuenta comprometida, actividad sospechosa",
    href: "/soporte?type=security",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    icon: HelpCircle,
    title: "Otro Problema",
    description: "Cualquier otro problema no listado anteriormente",
    href: "/soporte?type=other",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
  },
];

export default function ReportarPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Reportar un Problema</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Selecciona el tipo de problema que deseas reportar para que podamos ayudarte de la mejor manera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.title}
                href={type.href}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-gray-900/70 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${type.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${type.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Antes de reportar</h2>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Verifica que el problema no sea de tu conexión a internet
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Intenta actualizar la página o cerrar sesión y volver a entrar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Revisa nuestro <Link href="/ayuda" className="text-purple-400 hover:text-purple-300">Centro de Ayuda</Link> por si tu problema ya tiene solución
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Incluye capturas de pantalla si es posible para acelerar la resolución
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Para reportes urgentes de seguridad, contacta directamente a:
          </p>
          <a
            href="mailto:seguridad@apocaliptyx.com"
            className="text-red-400 hover:text-red-300 font-medium"
          >
            seguridad@apocaliptyx.com
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}