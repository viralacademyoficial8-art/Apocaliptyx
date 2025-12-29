"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuthStore, useScenarioStore } from "@/lib/stores";
import type { ScenarioCategory } from "@/types";
import { toast } from "@/components/ui/toast";

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
  const { user } = useAuthStore();
  const { createScenario } = useScenarioStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ScenarioCategory>("otros");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para crear un escenario.");
      return;
    }

    if (!title || !description || !dueDate) {
      toast.error("Completa todos los campos para crear tu escenario.");
      return;
    }

    // ✅ FIX: createScenario espera 1 argumento (el payload)
    createScenario({
  title,
  description,
  category,
  dueDate: new Date(dueDate).toISOString(), // ✅ string
});

    toast.success("Escenario creado. Ahora otros profetas podrán robártelo.");
    setTitle("");
    setDescription("");
    setCategory("otros");
    setDueDate("");
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500"
              placeholder="Ej. ¿Habrá una nueva pandemia global antes de 2030?"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500"
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
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-amber-500"
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
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-amber-500"
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
              <span className="font-semibold">200 AP Coins</span>
            </p>
            <p className="mt-1 text-[11px] text-amber-100/80">
              Si tu escenario se hace realidad, recuperarás tu apuesta y ganarás
              AP Coins extra del pozo. Si no, tu reputación como profeta se verá
              afectada.
            </p>
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110"
          >
            Lanzar escenario
          </button>
        </form>
      </section>
    </main>
  );
}
