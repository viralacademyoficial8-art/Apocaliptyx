"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/lib/stores";
import { scenariosService } from "@/services/scenarios.service";
import { notificationsService } from "@/services/notifications.service";
import type { ScenarioCategory } from "@/types";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

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

    setIsLoading(true);

    try {
      // Crear escenario en Supabase
      const newScenario = await scenariosService.create({
        title,
        description,
        category,
        resolutionDate: new Date(dueDate).toISOString(),
        creatorId: user.id,
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

      // Redirigir al escenario creado
      router.push(`/escenario/${newScenario.id}`);

    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Error al crear el escenario. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
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
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500 disabled:opacity-50"
              placeholder="Ej. ¿Habrá una nueva pandemia global antes de 2030?"
            />
          </div>

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
            disabled={isLoading || !title || !description || !dueDate}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando escenario...
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