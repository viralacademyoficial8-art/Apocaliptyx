"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/lib/stores";
import { scenariosService } from "@/services/scenarios.service";
import { notificationsService } from "@/services/notifications.service";
import { duplicateDetectionService, SimilarScenario } from "@/services/duplicateDetection.service";
import type { ScenarioCategory } from "@/types";
import { toast } from "@/components/ui/toast";
import { Loader2, AlertTriangle, X, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

const CATEGORIES: { value: ScenarioCategory; label: string }[] = [
  { value: "tecnologia", label: "💻 Tecnología" },
  { value: "politica", label: "🏛️ Política" },
  { value: "deportes", label: "⚽ Deportes" },
  { value: "farandula", label: "🎭 Farándula" },
  { value: "guerra", label: "⚔️ Guerra" },
  { value: "economia", label: "💰 Economía" },
  { value: "salud", label: "🏥 Salud" },
  { value: "otros", label: "📌 Otros" },
];

export default function CrearPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ScenarioCategory>("otros");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para detección de duplicados
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [similarScenarios, setSimilarScenarios] = useState<SimilarScenario[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);

  // Debounce para verificar duplicados mientras escribe
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.length >= 10) {
        checkDuplicates();
      } else {
        setSimilarScenarios([]);
        setShowDuplicateWarning(false);
        setIsDuplicate(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  // Verificar duplicados
  const checkDuplicates = useCallback(async () => {
    if (title.length < 10) return;

    setCheckingDuplicates(true);
    try {
      const result = await duplicateDetectionService.checkForDuplicates(title, description);
      
      setSimilarScenarios(result.similarScenarios);
      setIsDuplicate(result.isDuplicate);
      
      if (result.similarScenarios.length > 0) {
        setShowDuplicateWarning(true);
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    } finally {
      setCheckingDuplicates(false);
    }
  }, [title, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para crear un escenario.");
      return;
    }

    if (!title || !description || !dueDate) {
      toast.error("Completa todos los campos para crear tu escenario.");
      return;
    }

    // Si es duplicado y no ha forzado la creación, mostrar warning
    if (isDuplicate && !forceCreate) {
      setShowDuplicateWarning(true);
      toast.error("Este escenario parece ser similar a uno existente. Revisa las sugerencias.");
      return;
    }

    setIsLoading(true);

    try {
      // Generar hash del contenido
      const contentHash = duplicateDetectionService.generateContentHash(title, description);

      // Crear escenario en Supabase
      const newScenario = await scenariosService.create({
        title,
        description,
        category,
        resolutionDate: new Date(dueDate).toISOString(),
        creatorId: user.id,
        contentHash, // Agregar el hash
      });

      if (!newScenario) {
        toast.error("Error al crear el escenario. Intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      // Crear notificación de escenario creado
      await notificationsService.notifyScenarioCreated(
        user.id,
        title,
        newScenario.id
      );

      toast.success("¡Escenario creado exitosamente! 🎉");
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setCategory("otros");
      setDueDate("");
      setSimilarScenarios([]);
      setShowDuplicateWarning(false);
      setForceCreate(false);

      // Redirigir al escenario creado
      router.push(`/escenario/${newScenario.id}`);

    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Error al crear el escenario. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Permitir crear de todas formas
  const handleForceCreate = () => {
    setForceCreate(true);
    setShowDuplicateWarning(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-apocalypse-ash to-black text-zinc-50">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-50">
          Crea un nuevo escenario apocalíptico
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Describe un evento que podría suceder en el futuro. Si tu profecía se
          cumple, ganas AP Coins del pozo.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm"
        >
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Título del escenario</label>
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 pr-10 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500 disabled:opacity-50"
                placeholder="Ej. ¿Habrá una nueva pandemia global antes de 2030?"
              />
              {checkingDuplicates && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
              )}
            </div>
            {title.length > 0 && title.length < 10 && (
              <p className="text-[10px] text-zinc-500">
                Escribe al menos 10 caracteres para verificar duplicados
              </p>
            )}
          </div>

          {/* Alerta de escenarios similares */}
          {showDuplicateWarning && similarScenarios.length > 0 && (
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-400">
                      {isDuplicate 
                        ? "⚠️ Escenario posiblemente duplicado" 
                        : "Escenarios similares encontrados"}
                    </h3>
                    <p className="text-xs text-amber-200/80 mt-1">
                      {isDuplicate 
                        ? "Ya existe un escenario muy similar en la plataforma. Por favor, revisa antes de continuar."
                        : "Encontramos algunos escenarios parecidos. Verifica que no sea una idea repetida."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDuplicateWarning(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {similarScenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/escenario/${scenario.id}`}
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">
                        {scenario.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {scenario.description?.slice(0, 80)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        scenario.similarity > 80 
                          ? 'bg-red-500/20 text-red-400' 
                          : scenario.similarity > 60 
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {scenario.similarity}% similar
                      </span>
                      <ExternalLink className="w-4 h-4 text-zinc-500" />
                    </div>
                  </Link>
                ))}
              </div>

              {isDuplicate && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleForceCreate}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Crear de todas formas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setDescription("");
                      setSimilarScenarios([]);
                      setShowDuplicateWarning(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-black font-medium rounded-lg transition-colors"
                  >
                    Cambiar mi escenario
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de que pasó la verificación */}
          {title.length >= 10 && !checkingDuplicates && similarScenarios.length === 0 && (
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              ¡Título único! No encontramos escenarios similares.
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px] w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500 disabled:opacity-50"
              placeholder="Explica con detalle las condiciones del escenario y qué tendría que pasar exactamente para considerarlo cumplido."
            />
          </div>

          {/* Categoría y fecha límite */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-amber-500 disabled:opacity-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">
                Fecha límite para que se cumpla
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-amber-500 disabled:opacity-50"
              />
              <p className="mt-1 text-[10px] text-zinc-500">
                Después de esta fecha, la comunidad juzgará si tu profecía se
                cumplió o no.
              </p>
            </div>
          </div>

          {/* Info del costo */}
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-3 py-3 text-xs text-amber-100">
            <p className="font-medium">
              Coste de creación:{" "}
              <span className="font-semibold">Gratis (por ahora)</span>
            </p>
            <p className="mt-1 text-[11px] text-amber-100/80">
              Si tu escenario se hace realidad, ganarás AP Coins del pozo de
              predicciones. ¡Sé un verdadero profeta!
            </p>
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={isLoading || !title || !description || !dueDate || (isDuplicate && !forceCreate)}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando escenario...
              </>
            ) : checkingDuplicates ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-pulse" />
                Verificando...
              </>
            ) : (
              "Lanzar escenario"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}