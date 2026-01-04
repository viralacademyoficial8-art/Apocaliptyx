// src/app/about/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skull, Target, Users, Zap, Shield, Globe } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros | Apocaliptyx",
  description: "Conoce la historia y misión de Apocaliptyx",
};

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Precisión",
      description: "Valoramos la habilidad de analizar información y hacer predicciones certeras.",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Construimos un espacio donde los profetas digitales se conectan y compiten.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: Zap,
      title: "Diversión",
      description: "Creemos que predecir el futuro debe ser emocionante y entretenido.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      icon: Shield,
      title: "Integridad",
      description: "Operamos con transparencia y justicia en todas nuestras interacciones.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
  ];

  const stats = [
    { value: "2024", label: "Año de fundación" },
    { value: "12K+", label: "Profetas activos" },
    { value: "50K+", label: "Escenarios creados" },
    { value: "10M+", label: "Predicciones realizadas" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 max-w-4xl relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <Skull className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-red-500">APOCAL</span>
                <span className="text-yellow-500">IPTICS</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                La plataforma donde los profetas digitales demuestran quién puede ver el futuro.
              </p>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestra Historia</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Apocaliptyx nació de una idea simple: ¿y si pudiéramos convertir el arte de predecir 
                el futuro en un juego competitivo y social?
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                En 2024, un grupo de entusiastas de la tecnología y los mercados de predicción 
                decidió crear una plataforma que combinara la emoción de las apuestas con la 
                inteligencia del análisis predictivo, pero sin los riesgos del dinero real.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Hoy, Apocaliptyx es el hogar de miles de &quot;profetas digitales&quot; que compiten 
                diariamente para demostrar su capacidad de anticipar eventos en deportes, 
                economía, entretenimiento y más.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Misión */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
                <p className="text-gray-300">
                  Democratizar las predicciones y crear la comunidad más grande de analistas 
                  y visionarios digitales del mundo, donde cualquiera puede demostrar su 
                  capacidad de anticipar el futuro.
                </p>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Nuestra Visión</h2>
                <p className="text-gray-300">
                  Ser la plataforma de referencia global para predicciones, donde millones 
                  de personas compiten, aprenden y se divierten anticipando los eventos 
                  que moldean nuestro mundo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 ${value.bgColor} rounded-lg`}>
                        <Icon className={`w-6 h-6 ${value.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{value.title}</h3>
                    </div>
                    <p className="text-gray-400">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <Globe className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Presencia Global</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Operamos de forma 100% remota con un equipo distribuido alrededor del mundo. 
              Nuestros profetas digitales nos visitan desde más de 50 países.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇲🇽 México</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇺🇸 USA</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇪🇸 España</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇦🇷 Argentina</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇨🇴 Colombia</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">🇧🇷 Brasil</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">+ 44 más</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para demostrar tu visión?</h2>
            <p className="text-gray-400 mb-8">
              Únete a miles de profetas digitales y comienza a predecir el futuro hoy.
            </p>
            <a
              href="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-colors"
            >
              <Skull className="w-5 h-5" />
              Crear Cuenta Gratis
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}