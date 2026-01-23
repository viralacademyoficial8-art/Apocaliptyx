export const dynamic = 'force-dynamic';

// src/app/prensa/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newspaper, Download, Mail, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Prensa | Apocaliptyx",
  description: "Kit de prensa, noticias y recursos para medios de comunicación",
};

export default function PrensaPage() {
  const pressReleases = [
    {
      date: "2026-01-01",
      title: "Apocaliptyx lanza su plataforma de predicciones en Latinoamérica",
      excerpt: "La nueva plataforma de predicciones sociales busca revolucionar el entretenimiento digital.",
    },
    {
      date: "2025-12-15",
      title: "Apocaliptyx alcanza 10,000 usuarios en su fase beta",
      excerpt: "El crecimiento exponencial demuestra el interés del público por los mercados de predicción.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Newspaper className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Sala de Prensa</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Recursos, noticias y materiales para medios de comunicación
          </p>
        </div>

        {/* Kit de prensa */}
        <section className="mb-12">
          <div className="p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Kit de Prensa</h2>
            <p className="text-foreground mb-6">
              Descarga nuestro kit de prensa con logos, capturas de pantalla, información de la empresa 
              y todo lo que necesitas para escribir sobre Apocaliptyx.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                <Download className="w-5 h-5" />
                Descargar Kit Completo (ZIP)
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted rounded-lg font-medium transition-colors">
                <Download className="w-5 h-5" />
                Solo Logos (PNG/SVG)
              </button>
            </div>
          </div>
        </section>

        {/* Datos clave */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Datos Clave</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card/50 border border-border rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">2024</div>
              <div className="text-sm text-muted-foreground">Fundación</div>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">12K+</div>
              <div className="text-sm text-muted-foreground">Usuarios</div>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">50+</div>
              <div className="text-sm text-muted-foreground">Países</div>
            </div>
            <div className="p-4 bg-card/50 border border-border rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-muted-foreground">Remoto</div>
            </div>
          </div>
        </section>

        {/* Comunicados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Comunicados de Prensa</h2>
          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <div key={index} className="p-6 bg-card/50 border border-border rounded-xl hover:border-border transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(release.date).toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 mb-2">{release.title}</h3>
                    <p className="text-muted-foreground">{release.excerpt}</p>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* En los medios */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Apocaliptyx en los Medios</h2>
          <div className="p-8 bg-card/50 border border-border rounded-xl text-center">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Próximamente aparecerán aquí las menciones en medios de comunicación.
            </p>
          </div>
        </section>

        {/* Contacto de prensa */}
        <section>
          <div className="p-8 bg-card/50 border border-border rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Contacto de Prensa</h2>
                <p className="text-muted-foreground">Para consultas de medios</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Si eres periodista, blogger o representante de medios y deseas más información 
              sobre Apocaliptyx, estaremos encantados de ayudarte.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:prensa@apocaliptyx.com"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                prensa@apocaliptyx.com
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Tiempo de respuesta habitual: 24-48 horas
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}