export const dynamic = 'force-dynamic';

// src/app/careers/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Briefcase, MapPin, Clock, Zap, Users, Heart, Globe, Coffee, Laptop } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Trabaja con Nosotros | Apocaliptyx",
  description: "Únete al equipo de Apocaliptyx y ayúdanos a construir el futuro de las predicciones",
};

const benefits = [
  {
    icon: Globe,
    title: "100% Remoto",
    description: "Trabaja desde donde quieras, cuando quieras",
  },
  {
    icon: Clock,
    title: "Horario Flexible",
    description: "Nos importan los resultados, no las horas",
  },
  {
    icon: Laptop,
    title: "Equipo Incluido",
    description: "Te proporcionamos todo lo que necesitas",
  },
  {
    icon: Coffee,
    title: "Días de Descanso",
    description: "Vacaciones ilimitadas + días personales",
  },
  {
    icon: Heart,
    title: "Salud y Bienestar",
    description: "Seguro médico y apoyo de salud mental",
  },
  {
    icon: Zap,
    title: "Crecimiento",
    description: "Presupuesto para cursos y conferencias",
  },
];

const openPositions = [
  {
    id: 1,
    title: "Senior Full-Stack Developer",
    department: "Ingeniería",
    location: "Remoto (LATAM)",
    type: "Tiempo completo",
    description: "Buscamos un desarrollador full-stack con experiencia en React, Next.js y Node.js para liderar proyectos clave.",
  },
  {
    id: 2,
    title: "Product Designer (UI/UX)",
    department: "Diseño",
    location: "Remoto (Global)",
    type: "Tiempo completo",
    description: "Diseña experiencias increíbles para nuestra plataforma y ayuda a definir el futuro visual de Apocaliptyx.",
  },
  {
    id: 3,
    title: "Community Manager",
    department: "Marketing",
    location: "Remoto (LATAM)",
    type: "Tiempo completo",
    description: "Gestiona y haz crecer nuestra comunidad de profetas digitales en redes sociales y Discord.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 max-w-4xl relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6">
              <Briefcase className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Trabaja con Nosotros</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Únete a un equipo apasionado que está construyendo el futuro de las predicciones digitales.
            </p>
          </div>
        </section>

        {/* Por qué trabajar aquí */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">¿Por qué Apocaliptyx?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="font-bold text-white">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cultura */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                <Users className="w-10 h-10 text-purple-400 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Nuestra Cultura</h2>
                <p className="text-gray-300">
                  Somos un equipo pequeño pero poderoso. Valoramos la autonomía, la comunicación 
                  clara y la pasión por crear algo extraordinario. No tenemos burocracia innecesaria 
                  - si tienes una idea, puedes hacerla realidad.
                </p>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
                <Zap className="w-10 h-10 text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Lo que Buscamos</h2>
                <p className="text-gray-300">
                  Personas curiosas, autodidactas y con mentalidad de startup. Que les emocione 
                  construir productos que impacten a miles de usuarios. No necesitas título 
                  universitario - lo que importa es lo que puedes hacer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Posiciones abiertas */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Posiciones Abiertas</h2>
            
            {openPositions.length > 0 ? (
              <div className="space-y-4">
                {openPositions.map((position) => (
                  <div key={position.id} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{position.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                        </div>
                        <p className="text-gray-400">{position.description}</p>
                      </div>
                      <a
                        href={`mailto:careers@apocaliptyx.com?subject=Aplicación: ${position.title}`}
                        className="flex-shrink-0 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-center"
                      >
                        Aplicar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
                <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  No tenemos posiciones abiertas en este momento, pero siempre nos interesa conocer talento.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* No encuentras tu posición */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">¿No encuentras tu posición ideal?</h2>
            <p className="text-gray-400 mb-6">
              Si crees que puedes aportar algo único a Apocaliptyx, nos encantaría saber de ti. 
              Envíanos tu CV y cuéntanos por qué deberíamos trabajar juntos.
            </p>
            <a
              href="mailto:careers@apocaliptyx.com?subject=Aplicación espontánea"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Enviar Aplicación Espontánea
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}