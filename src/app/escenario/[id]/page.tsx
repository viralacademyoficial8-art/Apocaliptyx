"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore, useScenarioStore } from "@/lib/stores";
import { Navbar } from "@/components/Navbar";
import { LandingNavbar } from "@/components/LandingNavbar";
import { ScenarioDetail } from "@/components/ScenarioDetail";
import { ScenarioHistory } from "@/components/ScenarioHistory";
import { ScenarioComments } from "@/components/ScenarioComments";
import { Button } from "@/components/ui/button";
import { Scenario } from "@/types";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function EscenarioPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { scenarios, fetchScenarios } = useScenarioStore();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const scenarioId = params.id as string;

  // Cargar escenario inicial
  useEffect(() => {
    const loadScenario = async () => {
      setIsLoading(true);

      // Asegurarnos de tener escenarios en el store
      if (scenarios.length === 0) {
        await fetchScenarios();
      }

      // (opcional) pequeño delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Buscar escenario en el store
      const found = useScenarioStore
        .getState()
        .scenarios.find((s) => s.id === scenarioId);

      if (found) {
        setScenario(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }

      setIsLoading(false);
    };

    if (scenarioId) {
      loadScenario();
    }
  }, [scenarioId, fetchScenarios, scenarios.length]);

  // Refrescar cuando cambien los escenarios en el store
  useEffect(() => {
    if (scenarios.length > 0 && scenarioId) {
      const found = scenarios.find((s) => s.id === scenarioId);
      if (found) {
        setScenario(found);
        setNotFound(false);
      }
    }
  }, [scenarios, scenarioId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {isAuthenticated ? <Navbar /> : <LandingNavbar />}
        <div className="flex items-center justify-center py-24 sm:py-32 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">
              Cargando escenario...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !scenario) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {isAuthenticated ? <Navbar /> : <LandingNavbar />}
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              Escenario no encontrado
            </h1>
            <p className="text-gray-400 mb-8 text-sm sm:text-base">
              El escenario que buscas no existe o ha sido eliminado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Ver todos los escenarios
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {isAuthenticated ? <Navbar /> : <LandingNavbar />}

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white px-0 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Volver</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-6">
                <ScenarioDetail scenario={scenario} />
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-6">
                <ScenarioComments scenarioId={scenario.id} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-6">
                <ScenarioHistory
                  scenarioId={scenario.id}
                  creatorUsername={scenario.creatorUsername ?? "profeta_anonimo"}
                  creatorAvatar={scenario.creatorAvatar ?? ""}
                  currentPrice={scenario.currentPrice ?? 0}
                  createdAt={
                    (scenario.createdAt as any)
                      ? new Date(scenario.createdAt as any)
                      : new Date()
                  }
                />
              </div>

              {/* Related Scenarios - Placeholder */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                  Escenarios Relacionados
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Próximamente: escenarios similares basados en categoría y
                  tags.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
