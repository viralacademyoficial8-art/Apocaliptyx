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
import { useTranslation } from "@/hooks/useTranslation";

export default function CrearPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const CATEGORIES: { value: ScenarioCategory; label: string }[] = [
    { value: "tecnologia", label: `💻 ${t('home.categories.technology')}` },
    { value: "politica", label: `🏛️ ${t('home.categories.politics')}` },
    { value: "deportes", label: `⚽ ${t('home.categories.sports')}` },
    { value: "farandula", label: `🎭 ${t('home.categories.entertainment')}` },
    { value: "guerra", label: `⚔️ ${t('create.categories.war')}` },
    { value: "economia", label: `💰 ${t('home.categories.economy')}` },
    { value: "salud", label: `🏥 ${t('create.categories.health')}` },
    { value: "otros", label: `📌 ${t('explore.other')}` },
  ];

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
      toast.error(t('create.errors.loginRequired'));
      return;
    }

    if (!title || !description || !dueDate) {
      toast.error(t('create.errors.allFieldsRequired'));
      return;
    }

    // Si es duplicado, no permitir creación
    if (isDuplicate) {
      setShowDuplicateWarning(true);
      toast.error(t('create.errors.duplicateBlocked'));
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
        toast.error(t('create.errors.createFailed'));
        setIsLoading(false);
        return;
      }

      // Crear notificación de escenario creado
      await notificationsService.notifyScenarioCreated(
        user.id,
        title,
        newScenario.id
      );

      toast.success(t('create.success'));
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setCategory("otros");
      setDueDate("");
      setSimilarScenarios([]);
      setShowDuplicateWarning(false);

      // Redirigir al escenario creado
      router.push(`/escenario/${newScenario.id}`);

    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error(t('create.errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Redirigir al escenario existente para participar
  const handleGoToExistingScenario = (scenarioId: string) => {
    router.push(`/escenario/${scenarioId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-apocalypse-ash to-black text-zinc-50">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-50">
          {t('create.title')}
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          {t('create.subtitle')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm"
        >
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">{t('create.scenarioTitle')}</label>
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 pr-10 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500 disabled:opacity-50"
                placeholder={t('create.titlePlaceholder')}
              />
              {checkingDuplicates && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
              )}
            </div>
            {title.length > 0 && title.length < 10 && (
              <p className="text-[10px] text-zinc-500">
                {t('create.minCharsHint')}
              </p>
            )}
          </div>

          {/* Alerta de escenarios similares/duplicados */}
          {showDuplicateWarning && similarScenarios.length > 0 && (
            <div className={`rounded-xl border p-4 ${
              isDuplicate
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-amber-500/50 bg-amber-500/10'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    isDuplicate ? 'text-red-500' : 'text-amber-500'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      isDuplicate ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {isDuplicate
                        ? `🚫 ${t('create.duplicates.cannotCreate')}`
                        : t('create.duplicates.similarFound')}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isDuplicate ? 'text-red-200/80' : 'text-amber-200/80'
                    }`}>
                      {isDuplicate
                        ? t('create.duplicates.duplicateBlocked')
                        : t('create.duplicates.similarWarning')}
                    </p>
                  </div>
                </div>
                {!isDuplicate && (
                  <button
                    type="button"
                    onClick={() => setShowDuplicateWarning(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {similarScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isDuplicate
                        ? 'bg-zinc-900/50 hover:bg-zinc-800/70 border border-transparent hover:border-purple-500/50'
                        : 'bg-zinc-900/50'
                    }`}
                    onClick={() => isDuplicate && handleGoToExistingScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {scenario.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {scenario.description?.slice(0, 60)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          scenario.similarity >= 70
                            ? 'bg-red-500/20 text-red-400'
                            : scenario.similarity > 60
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          {scenario.similarity}%
                        </span>
                      </div>
                    </div>
                    {/* Info de robo */}
                    {isDuplicate && (
                      <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span>👑</span>
                          <span>Holder: <span className="text-purple-400">@{scenario.holder_username || 'creador'}</span></span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-400 font-bold">⚡ {scenario.current_price || 11} AP</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isDuplicate && similarScenarios.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚡</span>
                    <h4 className="text-sm font-bold text-white">¡Roba este escenario!</h4>
                  </div>
                  <p className="text-xs text-purple-200/80 mb-3">
                    {t('create.duplicates.participateInstead')}
                  </p>
                  <div className="bg-zinc-900/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-400">Holder actual</p>
                        <p className="text-sm font-medium text-purple-400">@{similarScenarios[0]?.holder_username || 'creador'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400">Precio para robar</p>
                        <p className="text-lg font-bold text-yellow-400">{similarScenarios[0]?.current_price || 11} AP</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoToExistingScenario(similarScenarios[0].id)}
                    className="w-full px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    <span>⚡</span>
                    Robar por {similarScenarios[0]?.current_price || 11} AP
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-2">
                    Haz clic para ir al escenario y comprarlo
                  </p>
                </div>
              )}

              {!isDuplicate && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setDescription("");
                      setSimilarScenarios([]);
                      setShowDuplicateWarning(false);
                    }}
                    className="w-full px-3 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-black font-medium rounded-lg transition-colors"
                  >
                    {t('create.duplicates.changeScenario')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de que pasó la verificación */}
          {title.length >= 10 && !checkingDuplicates && similarScenarios.length === 0 && (
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {t('create.uniqueTitle')}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">{t('scenarios.create.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px] w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-500 disabled:opacity-50"
              placeholder={t('create.descriptionPlaceholder')}
            />
          </div>

          {/* Categoría y fecha límite */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">{t('scenarios.create.category')}</label>
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
                {t('create.deadlineLabel')}
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
                {t('create.deadlineHint')}
              </p>
            </div>
          </div>

          {/* Info del costo */}
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-3 py-3 text-xs text-amber-100">
            <p className="font-medium">
              {t('create.creationCost')}:{" "}
              <span className="font-semibold">{t('create.freeForNow')}</span>
            </p>
            <p className="mt-1 text-[11px] text-amber-100/80">
              {t('create.rewardInfo')}
            </p>
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={isLoading || !title || !description || !dueDate || isDuplicate}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('create.creating')}
              </>
            ) : checkingDuplicates ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-pulse" />
                {t('create.verifying')}
              </>
            ) : (
              t('create.launchScenario')
            )}
          </button>
        </form>
      </section>
    </main>
  );
}