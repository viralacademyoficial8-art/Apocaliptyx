"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const { user, refreshBalance } = useAuthStore();
  const { t } = useTranslation();

  // Sincronizar sesión de NextAuth con Zustand
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      refreshBalance();
    }
  }, [status, session, user, refreshBalance]);

  // Usar datos de Zustand si existen, sino de la session
  const currentUser = user || (session?.user ? {
    id: session.user.id || "",
    username: (session.user as any).username || session.user.email?.split("@")[0] || "user",
  } : null);

  const isLoggedIn = status === "authenticated" && !!session?.user;

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

  // Calcular fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Validar fecha al cambiar
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);

    if (selected <= today) {
      toast.error('La fecha debe ser posterior a hoy');
      setDueDate('');
      return;
    }

    setDueDate(selectedDate);
  };

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

    if (!isLoggedIn || !currentUser?.id) {
      toast.error(t('create.errors.loginRequired'));
      router.push('/login');
      return;
    }

    if (!title || !description || !dueDate) {
      toast.error(t('create.errors.allFieldsRequired'));
      return;
    }

    // Validar que la fecha sea posterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate <= today) {
      toast.error(t('create.errors.futureDateRequired') || 'La fecha límite debe ser posterior a hoy');
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
        creatorId: currentUser.id,
        contentHash, // Agregar el hash
      });

      if (!newScenario) {
        toast.error(t('create.errors.createFailed'));
        setIsLoading(false);
        return;
      }

      // Crear notificación de escenario creado
      await notificationsService.notifyScenarioCreated(
        currentUser.id,
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
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 via-background to-background dark:from-background dark:via-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8">
        {/* Header with gradient accent */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-amber-400/30 to-orange-400/20 dark:from-amber-500/10 dark:to-orange-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              {t('create.title')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('create.subtitle')}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-amber-200/50 dark:border-border bg-white dark:bg-card p-6 text-sm shadow-xl shadow-amber-500/5 dark:shadow-none"
        >
          {/* Título */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wide">{t('create.scenarioTitle')}</label>
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-4 py-3 pr-10 text-sm text-foreground outline-none placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:border-amber-500 focus:bg-white dark:focus:bg-muted focus:shadow-lg focus:shadow-amber-500/10 transition-all disabled:opacity-50"
                placeholder={t('create.titlePlaceholder')}
              />
              {checkingDuplicates && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
              )}
            </div>
            {title.length > 0 && title.length < 10 && (
              <p className="text-[10px] text-muted-foreground">
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
                      isDuplicate ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {isDuplicate
                        ? `🚫 ${t('create.duplicates.cannotCreate')}`
                        : t('create.duplicates.similarFound')}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isDuplicate ? 'text-red-600 dark:text-red-200/80' : 'text-amber-700 dark:text-amber-200/80'
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
                    className="text-muted-foreground hover:text-foreground"
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
                        ? 'bg-muted/50 hover:bg-muted border border-transparent hover:border-purple-500/50'
                        : 'bg-muted/50'
                    }`}
                    onClick={() => isDuplicate && handleGoToExistingScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {scenario.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {scenario.description?.slice(0, 60)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          scenario.similarity >= 70
                            ? 'bg-red-500/20 text-red-500 dark:text-red-400'
                            : scenario.similarity > 60
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {scenario.similarity}%
                        </span>
                      </div>
                    </div>
                    {/* Info de robo */}
                    {isDuplicate && (
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>👑</span>
                          <span>Holder: {scenario.holder_username ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/perfil/${scenario.holder_username}`);
                              }}
                              className="text-purple-500 dark:text-purple-400 hover:text-purple-400 dark:hover:text-purple-300 hover:underline"
                            >
                              @{scenario.holder_username}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">Dueño original</span>
                          )}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-500 dark:text-yellow-400 font-bold">⚡ {scenario.current_price || 11} AP</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isDuplicate && similarScenarios.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <h4 className="text-sm font-bold text-foreground">¡Este escenario ya existe!</h4>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-200/80 mb-3">
                    Participa en el escenario existente robándolo al holder actual.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Holder actual</p>
                        {similarScenarios[0]?.holder_username ? (
                          <button
                            type="button"
                            onClick={() => router.push(`/perfil/${similarScenarios[0].holder_username}`)}
                            className="text-sm font-medium text-purple-500 dark:text-purple-400 hover:text-purple-400 dark:hover:text-purple-300 hover:underline"
                          >
                            @{similarScenarios[0].holder_username}
                          </button>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground">Creador original</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Precio actual</p>
                        <p className="text-lg font-bold text-yellow-500 dark:text-yellow-400">{similarScenarios[0]?.current_price || 11} AP</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoToExistingScenario(similarScenarios[0].id)}
                    className="w-full px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    <span>⚡</span>
                    Robar escenario por {similarScenarios[0]?.current_price || 11} AP
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Haz clic para ir al escenario y robarlo
                  </p>
                </div>
              )}

              {!isDuplicate && (
                <div className="mt-3 space-y-2">
                  {/* Opción de robar el escenario similar */}
                  {similarScenarios.length > 0 && (
                    <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-xs text-purple-700 dark:text-purple-200/80 mb-2">
                        ¿Te gusta este escenario? ¡Róbalo en lugar de crear uno nuevo!
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGoToExistingScenario(similarScenarios[0].id)}
                        className="w-full px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span>⚡</span>
                        Robar por {similarScenarios[0]?.current_price || 11} AP
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setDescription("");
                      setSimilarScenarios([]);
                      setShowDuplicateWarning(false);
                    }}
                    className="w-full px-3 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
                  >
                    {t('create.duplicates.changeScenario')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de que pasó la verificación */}
          {title.length >= 10 && !checkingDuplicates && similarScenarios.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-700 dark:text-green-400 text-xs font-medium">{t('create.uniqueTitle')}</span>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wide">{t('scenarios.create.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="min-h-[140px] w-full rounded-xl border-2 border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:border-amber-500 focus:bg-white dark:focus:bg-muted focus:shadow-lg focus:shadow-amber-500/10 transition-all disabled:opacity-50 resize-none"
              placeholder={t('create.descriptionPlaceholder')}
            />
          </div>

          {/* Categoría y fecha límite */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wide">{t('scenarios.create.category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                disabled={isLoading}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-muted focus:shadow-lg focus:shadow-amber-500/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wide">
                {t('create.deadlineLabel')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={handleDateChange}
                disabled={isLoading}
                min={getMinDate()}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-muted focus:shadow-lg focus:shadow-amber-500/10 transition-all disabled:opacity-50 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-muted-foreground">
                {t('create.deadlineHint')}
              </p>
            </div>
          </div>

          {/* Info del costo */}
          <div className="relative overflow-hidden rounded-xl border border-amber-300 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent px-4 py-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-200/50 to-transparent dark:from-amber-500/10 rounded-bl-full" />
            <div className="relative flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500/30 dark:to-orange-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                  {t('create.creationCost')}:{" "}
                  <span className="text-green-600 dark:text-green-400">{t('create.freeForNow')}</span>
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-100/80">
                  {t('create.rewardInfo')}
                </p>
              </div>
            </div>
          </div>

          {/* Botón enviar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !title || !description || !dueDate || isDuplicate}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('create.creating')}
                </>
              ) : checkingDuplicates ? (
                <>
                  <Search className="w-5 h-5 mr-2 animate-pulse" />
                  {t('create.verifying')}
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  {t('create.launchScenario')}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
