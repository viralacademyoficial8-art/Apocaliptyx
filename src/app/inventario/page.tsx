"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/lib/stores";
import { profileService, UserProfileFromDB, UserStatsFromDB } from "@/services/profile.service";
import { predictionsService } from "@/services/predictions.service";
import { scenariosService } from "@/services/scenarios.service";
import { shopService, UserInventoryItem } from "@/services/shop.service";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Coins,
  Settings,
  CheckCircle,
  Star,
  Package,
  Shield,
  Zap,
  Eye,
  Sparkles,
  Gift,
  Box,
  Infinity,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";

// Iconos por tipo de item
const typeIcons: Record<string, React.ElementType> = {
  PROTECTION: Shield,
  BOOST: Zap,
  POWER: Eye,
  COSMETIC: Sparkles,
  SPECIAL: Gift,
  BUNDLE: Box,
};

// Colores por rareza
const rarityColors: Record<string, string> = {
  COMMON: "border-gray-500 bg-gray-500/10",
  RARE: "border-blue-500 bg-blue-500/10",
  EPIC: "border-purple-500 bg-purple-500/10",
  LEGENDARY: "border-yellow-500 bg-yellow-500/10",
};

const rarityTextColors: Record<string, string> = {
  COMMON: "text-gray-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-yellow-400",
};

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasInfiniteCoins } = usePermissions();

  const [profile, setProfile] = useState<UserProfileFromDB | null>(null);
  const [stats, setStats] = useState<UserStatsFromDB | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "predictions" | "scenarios">("overview");

  // Esperar hidratación de Zustand
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Cargar datos del perfil
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      // Cargar perfil
      const profileData = await profileService.getById(user.id);
      if (profileData) {
        setProfile(profileData);
      }

      // Cargar estadísticas
      const statsData = await profileService.getStats(user.id);
      setStats(statsData);

      // Cargar predicciones recientes
      const predictionsData = await predictionsService.getByUserId(user.id);
      setPredictions(predictionsData.slice(0, 10));

      // Cargar escenarios creados
      const scenariosData = await scenariosService.getByCreator(user.id);
      setScenarios(scenariosData.slice(0, 10));

      // Cargar inventario
      const inventoryData = await shopService.getUserInventory(user.id);
      setInventory(inventoryData);

    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [hydrated, user?.id, router, loadProfile]);

  // Mostrar loading mientras se hidrata o carga
  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <User className="w-16 h-16 text-gray-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Perfil no encontrado</h1>
          <p className="text-gray-400 mb-6">No se pudo cargar tu perfil.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Calcular XP para el siguiente nivel (simulado)
  const xpProgress = ((profile.xp % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header del perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600" />

          {/* Info principal */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                {profile.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Nombre y username */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.is_premium && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-gray-400">@{profile.username}</p>
              </div>

              {/* Botón editar */}
              <Link
                href="/configuracion"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </Link>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-gray-300">{profile.bio}</p>
            )}

            {/* Info adicional */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Miembro desde {new Date(profile.created_at).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-xl p-4 text-center ${
            hasInfiniteCoins
              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
              : 'bg-gray-900 border border-gray-800'
          }`}>
            {hasInfiniteCoins ? (
              <Infinity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            ) : (
              <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            )}
            <p className="text-2xl font-bold">
              {hasInfiniteCoins ? '∞' : profile.ap_coins.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">AP Coins</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">Nivel {profile.level}</p>
            <p className="text-sm text-gray-400">{profile.xp} XP</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalPredictions || 0}</p>
            <p className="text-sm text-gray-400">Predicciones</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.accuracy || 0}%</p>
            <p className="text-sm text-gray-400">Precisión</p>
          </div>
        </div>

        {/* Level progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Nivel {profile.level}</span>
            <span className="text-gray-400">Nivel {profile.level + 1}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {profile.xp % 1000} / 1000 XP para el siguiente nivel
          </p>
        </div>

        {/* Stats detallados */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Predicciones correctas</p>
            <p className="text-xl font-bold text-green-400">
              {stats?.correctPredictions || 0} / {stats?.totalPredictions || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Ganancias totales</p>
            <p className="text-xl font-bold text-yellow-400">
              {(stats?.totalEarnings || 0).toLocaleString()} AP
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Escenarios creados</p>
            <p className="text-xl font-bold text-purple-400">
              {stats?.scenariosCreated || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Seguidores</p>
            <p className="text-xl font-bold">{stats?.followersCount || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Siguiendo</p>
            <p className="text-xl font-bold">{stats?.followingCount || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Items en inventario</p>
            <p className="text-xl font-bold text-pink-400">{inventory.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "inventory"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Package className="w-4 h-4" />
            Inventario ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("predictions")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "predictions"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Mis Predicciones ({predictions.length})
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "scenarios"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Mis Escenarios ({scenarios.length})
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Predicciones recientes */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Predicciones recientes</h3>
              {predictions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No tienes predicciones aún
                </p>
              ) : (
                <div className="space-y-3">
                  {predictions.slice(0, 5).map((pred) => (
                    <div
                      key={pred.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {pred.prediction === "YES" ? "SÍ" : "NO"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {pred.amount} AP
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          pred.status === "WON"
                            ? "bg-green-500/20 text-green-400"
                            : pred.status === "LOST"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {pred.status === "WON"
                          ? "Ganada"
                          : pred.status === "LOST"
                          ? "Perdida"
                          : "Pendiente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Escenarios creados */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Escenarios creados</h3>
              {scenarios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No has creado escenarios aún</p>
                  <Link
                    href="/crear"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg inline-block"
                  >
                    Crear escenario
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.slice(0, 5).map((scenario) => (
                    <Link
                      key={scenario.id}
                      href={`/escenario/${scenario.id}`}
                      className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium text-sm line-clamp-1">
                        {scenario.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {scenario.total_pool} AP en juego
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Inventario */}
        {activeTab === "inventory" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Mi Inventario
              </h3>
              <Link
                href="/tienda"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Ir a la Tienda
              </Link>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Tu inventario está vacío</p>
                <p className="text-gray-500 text-sm mb-6">
                  Compra items en la tienda para potenciar tus predicciones
                </p>
                <Link
                  href="/tienda"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Explorar Tienda
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((inv) => {
                  const item = inv.item;
                  if (!item) return null;

                  const rarity = item.rarity || "COMMON";
                  const Icon = typeIcons[item.type] || Package;

                  return (
                    <div
                      key={inv.id}
                      className={`relative border-2 rounded-xl p-4 ${rarityColors[rarity]} transition-all hover:scale-[1.02]`}
                    >
                      {/* Badge cantidad */}
                      {inv.quantity > 1 && (
                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                          x{inv.quantity}
                        </span>
                      )}

                      {/* Equipado badge */}
                      {inv.is_equipped && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                          Equipado
                        </span>
                      )}

                      {/* Icono */}
                      <div className="flex justify-center mb-3 mt-2">
                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
                          {item.icon || <Icon className="w-7 h-7 text-gray-400" />}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <h4 className="font-bold text-white text-sm mb-1">
                          {item.name}
                        </h4>
                        <p className={`text-xs font-medium mb-2 ${rarityTextColors[rarity]}`}>
                          {rarity}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {inventory.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/inventario"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Ver inventario completo →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "predictions" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Historial de predicciones</h3>
            {predictions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No tienes predicciones aún. ¡Explora escenarios y haz tu primera predicción!
              </p>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred) => (
                  <div
                    key={pred.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Votaste: {pred.prediction === "YES" ? "SÍ" : "NO"}
                      </p>
                      <p className="text-sm text-gray-400">
                        Apostaste {pred.amount} AP Coins
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pred.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          pred.status === "WON"
                            ? "bg-green-500/20 text-green-400"
                            : pred.status === "LOST"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {pred.status === "WON"
                          ? `+${pred.profit} AP`
                          : pred.status === "LOST"
                          ? `-${pred.amount} AP`
                          : "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Mis escenarios</h3>
              <Link
                href="/crear"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
              >
                + Crear nuevo
              </Link>
            </div>
            {scenarios.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No has creado escenarios aún
              </p>
            ) : (
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/escenario/${scenario.id}`}
                    className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{scenario.title}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {scenario.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Creado el {new Date(scenario.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">
                          {scenario.total_pool} AP
                        </p>
                        <p className="text-xs text-gray-400">
                          {scenario.participant_count} participantes
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}