'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { publicProfileService, PublicProfile } from '@/services/publicProfile.service';
import { chatService } from '@/services/chat.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  User,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Settings,
  UserPlus,
  UserMinus,
  MessageCircle,
  MoreHorizontal,
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Star,
  CheckCircle,
  Crown,
  Loader2,
  Shield,
  Award,
  Zap,
  Eye,
  Users,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'general' | 'predictions' | 'scenarios' | 'activity';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const isOwnProfile = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  // Iniciar chat con usuario
  const handleStartChat = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    setChatLoading(true);
    try {
      const conversation = await chatService.getOrCreateConversation(currentUser.id, profile.id);
      if (conversation) {
        router.push(`/mensajes?conv=${conversation.id}`);
      } else {
        toast.error('Error al iniciar la conversación');
      }
    } catch (error) {
      toast.error('Error al iniciar la conversación');
    } finally {
      setChatLoading(false);
    }
  };

  // Cargar perfil
  const loadProfile = useCallback(async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const data = await publicProfileService.getByUsername(username);
      setProfile(data);

      if (data && currentUser?.id && !isOwnProfile) {
        const following = await publicProfileService.isFollowing(currentUser.id, data.id);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser?.id, isOwnProfile]);

  // Cargar datos adicionales según tab
  const loadTabData = useCallback(async () => {
    if (!profile?.id) return;

    if (activeTab === 'predictions' && predictions.length === 0) {
      const data = await publicProfileService.getPredictions(profile.id);
      setPredictions(data);
    }
    if (activeTab === 'scenarios' && scenarios.length === 0) {
      const data = await publicProfileService.getCreatedScenarios(profile.id);
      setScenarios(data);
    }
    if (activeTab === 'activity' && activity.length === 0) {
      const data = await publicProfileService.getActivity(profile.id);
      setActivity(data);
    }
  }, [profile?.id, activeTab, predictions.length, scenarios.length, activity.length]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Seguir/dejar de seguir
  const handleFollow = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await publicProfileService.unfollow(currentUser.id, profile.id);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null);
        toast.success('Dejaste de seguir a este usuario');
      } else {
        await publicProfileService.follow(currentUser.id, profile.id);
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);
        toast.success('¡Ahora sigues a este usuario!');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setFollowLoading(false);
    }
  };

  // Calcular nivel de título basado en stats
  const getTitle = () => {
    if (!profile) return 'Profeta';
    if (profile.level >= 50) return 'Oráculo Supremo';
    if (profile.level >= 30) return 'Gran Vidente';
    if (profile.level >= 20) return 'Profeta Experto';
    if (profile.level >= 10) return 'Vidente';
    return 'Profeta Novato';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <User className="w-16 h-16 text-gray-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Usuario no encontrado</h1>
          <p className="text-gray-400 mb-6">@{username} no existe</p>
          <Link
            href="/explorar"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Explorar escenarios
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const xpProgress = ((profile.xp % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
          {profile.banner_url && (
            <img
              src={profile.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-4 sm:left-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 ${profile.is_premium ? 'border-yellow-500' : 'border-gray-950'} bg-gray-800 overflow-hidden`}>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold">
                    {(profile.display_name || profile.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-950">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 gap-2">
            {isOwnProfile ? (
              <Link
                href="/configuracion"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Editar perfil
              </Link>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isFollowing
                      ? 'bg-gray-800 hover:bg-red-600/20 hover:text-red-400'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Siguiendo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Seguir
                    </>
                  )}
                </button>
                <button 
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="mt-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              {profile.is_premium && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
              {profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' ? (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : profile.role === 'MODERATOR' ? (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Moderador
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-purple-400 font-medium">{getTitle()}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">@{profile.username}</span>
            </div>

            {profile.bio && (
              <p className="mt-3 text-gray-300 max-w-2xl">{profile.bio}</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Se unió {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: es })}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.is_verified && (
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Verificado
                </span>
              )}
              {profile.is_premium && (
                <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              )}
              {profile.rank <= 10 && profile.rank > 0 && (
                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  Top {profile.rank}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="text-center">
                <span className="text-xl font-bold">{profile.followers_count}</span>
                <span className="text-gray-400 text-sm ml-1">seguidores</span>
              </div>
              <div className="text-center">
                <span className="text-xl font-bold">{profile.following_count}</span>
                <span className="text-gray-400 text-sm ml-1">siguiendo</span>
              </div>
              <div className="text-center">
                <span className="text-xl font-bold">#{profile.rank || '-'}</span>
                <span className="text-gray-400 text-sm ml-1">ranking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Nivel {profile.level}</span>
            <span className="text-gray-400">{profile.xp} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 sm:px-6 py-6 border-t border-gray-800">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.total_predictions}</p>
            <p className="text-sm text-gray-400">Predicciones</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.correct_predictions}</p>
            <p className="text-sm text-gray-400">Aciertos</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.accuracy}%</p>
            <p className="text-sm text-gray-400">Precisión</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <Flame className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.total_earnings.toLocaleString()}</p>
            <p className="text-sm text-gray-400">AP Ganadas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-800">
          <div className="flex overflow-x-auto px-4 sm:px-6">
            {[
              { id: 'general', label: 'General', icon: User },
              { id: 'predictions', label: 'Predicciones', icon: Target },
              { id: 'scenarios', label: 'Escenarios', icon: Zap },
              { id: 'activity', label: 'Actividad', icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 sm:px-6 py-8">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Información
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nivel</span>
                    <span className="font-medium">{profile.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP Total</span>
                    <span className="font-medium">{profile.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ranking</span>
                    <span className="font-medium">#{profile.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precisión</span>
                    <span className="font-medium text-green-400">{profile.accuracy}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Estadísticas
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Predicciones totales</span>
                    <span className="font-medium">{profile.total_predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Predicciones correctas</span>
                    <span className="font-medium text-green-400">{profile.correct_predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AP Coins ganadas</span>
                    <span className="font-medium text-yellow-400">{profile.total_earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Historial de Predicciones</h3>
              {predictions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay predicciones aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((pred) => (
                    <div
                      key={pred.id}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{pred.scenario?.title || 'Escenario'}</p>
                        <p className="text-sm text-gray-400">
                          Predijo: {pred.prediction === 'YES' ? 'SÍ' : 'NO'} • {pred.amount} AP
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        pred.status === 'WON' ? 'bg-green-500/20 text-green-400' :
                        pred.status === 'LOST' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {pred.status === 'WON' ? 'Ganada' : pred.status === 'LOST' ? 'Perdida' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Escenarios Creados</h3>
              {scenarios.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ha creado escenarios aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <Link
                      key={scenario.id}
                      href={`/escenario/${scenario.id}`}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        {scenario.category}
                      </span>
                      <h4 className="font-medium mt-2 line-clamp-2">{scenario.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{scenario.total_pool?.toLocaleString() || 0} AP</span>
                        <span>{scenario.participant_count || 0} participantes</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Actividad Reciente</h3>
              {activity.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}