'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { publicProfileService, PublicProfile } from '@/services/publicProfile.service';
import { chatService } from '@/services/chat.service';
import { getSupabaseBrowser } from '@/lib/supabase-client';
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
  Copy,
  Flag,
  Ban,
  BellOff,
  Bell,
  UserX,
  Share2,
  Skull,
  Bookmark,
  Heart,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ForumPost } from '@/services/forum.service';


// Razones de reporte
const REPORT_REASONS = [
  { id: 'spam', label: 'Spam o publicidad' },
  { id: 'harassment', label: 'Acoso o bullying' },
  { id: 'inappropriate', label: 'Contenido inapropiado' },
  { id: 'impersonation', label: 'Suplantación de identidad' },
  { id: 'scam', label: 'Estafa o fraude' },
  { id: 'other', label: 'Otro motivo' },
];

type TabType = 'general' | 'stolen' | 'scenarios' | 'activity' | 'guardados';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  const supabase = getSupabaseBrowser();

  // Leer tab desde URL params
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const initialTab: TabType = tabFromUrl && ['general', 'stolen', 'scenarios', 'activity', 'guardados'].includes(tabFromUrl) ? tabFromUrl : 'general';

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [stolenScenarios, setStolenScenarios] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<ForumPost[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // Estado para escenarios en posesión (Holder Actual)
  const [scenariosHeldCount, setScenariosHeldCount] = useState(0);

  // Estados para modales de seguidores/siguiendo
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Estados para menú de opciones
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const isOwnProfile = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  // Iniciar chat con usuario
  const handleStartChat = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    setChatLoading(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });

      const data = await response.json();

      if (response.ok && data.conversation) {
        router.push(`/mensajes?conv=${data.conversation.id}`);
      } else {
        toast.error(data.error || 'Error al iniciar la conversación');
      }
    } catch (error) {
      toast.error('Error al iniciar la conversación');
    } finally {
      setChatLoading(false);
    }
  };

  // Copiar link del perfil
  const handleCopyLink = () => {
    const url = `${window.location.origin}/perfil/${profile?.username}`;
    navigator.clipboard.writeText(url);
    toast.success('¡Link copiado al portapapeles!');
  };

  // Compartir perfil
  const handleShare = async () => {
    const url = `${window.location.origin}/perfil/${profile?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile?.display_name || profile?.username}`,
          text: `Mira el perfil de ${profile?.display_name || profile?.username} en Apocaliptyx`,
          url: url,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Cargar lista de seguidores
  const loadFollowers = async () => {
    if (!profile?.id) return;
    setLoadingFollowers(true);
    try {
      const followers = await publicProfileService.getFollowers(profile.id);
      setFollowersList(followers);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Cargar lista de siguiendo
  const loadFollowing = async () => {
    if (!profile?.id) return;
    setLoadingFollowing(true);
    try {
      const following = await publicProfileService.getFollowing(profile.id);
      setFollowingList(following);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Abrir modal de seguidores
  const handleOpenFollowers = () => {
    setShowFollowersModal(true);
    loadFollowers();
  };

  // Abrir modal de siguiendo
  const handleOpenFollowing = () => {
    setShowFollowingModal(true);
    loadFollowing();
  };

  // Verificar estados de bloqueo y silencio
  const checkBlockMuteStatus = useCallback(async () => {
    if (!currentUser?.id || !profile?.id) return;

    // Verificar bloqueo
    const { data: blockData } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', currentUser.id)
      .eq('blocked_id', profile.id)
      .single();
    setIsBlocked(!!blockData);

    // Verificar silencio
    const { data: muteData } = await supabase
      .from('user_mutes')
      .select('id')
      .eq('muter_id', currentUser.id)
      .eq('muted_id', profile.id)
      .single();
    setIsMuted(!!muteData);
  }, [currentUser?.id, profile?.id]);

  // Bloquear/Desbloquear usuario
  const handleToggleBlock = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    try {
      if (isBlocked) {
        // Desbloquear
        await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', currentUser.id)
          .eq('blocked_id', profile.id);
        setIsBlocked(false);
        toast.success('Usuario desbloqueado');
      } else {
        // Bloquear
        await supabase
          .from('user_blocks')
          .insert({
            blocker_id: currentUser.id,
            blocked_id: profile.id,
          });
        setIsBlocked(true);
        // También dejar de seguir si lo seguía
        if (isFollowing) {
          await publicProfileService.unfollow(currentUser.id, profile.id);
          setIsFollowing(false);
          setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null);
        }
        toast.success('Usuario bloqueado');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    }
  };

  // Silenciar/Desilenciar usuario
  const handleToggleMute = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    try {
      if (isMuted) {
        // Desilenciar
        await supabase
          .from('user_mutes')
          .delete()
          .eq('muter_id', currentUser.id)
          .eq('muted_id', profile.id);
        setIsMuted(false);
        toast.success('Usuario desilenciado');
      } else {
        // Silenciar
        await supabase
          .from('user_mutes')
          .insert({
            muter_id: currentUser.id,
            muted_id: profile.id,
          });
        setIsMuted(true);
        toast.success('Usuario silenciado. No recibirás notificaciones de este usuario.');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    }
  };

  // Enviar reporte
  const handleReport = async () => {
    if (!currentUser?.id || !profile?.id) {
      router.push('/login');
      return;
    }

    if (!reportReason) {
      toast.error('Selecciona un motivo');
      return;
    }

    setReportLoading(true);
    try {
      await supabase
        .from('user_reports')
        .insert({
          reporter_id: currentUser.id,
          reported_id: profile.id,
          reason: reportReason,
          description: reportDescription,
          status: 'pending',
        });

      toast.success('Reporte enviado. Nuestro equipo lo revisará pronto.');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      toast.error('Error al enviar el reporte');
    } finally {
      setReportLoading(false);
    }
  };

  // Cargar estados de bloqueo/silencio cuando se carga el perfil
  useEffect(() => {
    if (profile?.id && currentUser?.id && !isOwnProfile) {
      checkBlockMuteStatus();
    }
  }, [profile?.id, currentUser?.id, isOwnProfile, checkBlockMuteStatus]);

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

  // Cargar conteo de escenarios en posesión (Holder Actual)
  const loadScenariosHeldCount = useCallback(async (userId: string) => {
    try {
      // Contar escenarios donde el usuario es el holder actual (creados o robados que aún posee)
      const { count, error } = await supabase
        .from('scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('current_holder_id', userId)
        .eq('status', 'ACTIVE');

      if (!error && count !== null) {
        setScenariosHeldCount(count);
      }
    } catch (error) {
      console.error('Error loading scenarios held count:', error);
    }
  }, [supabase]);

  // Efecto para cargar el conteo cuando se carga el perfil
  useEffect(() => {
    if (profile?.id) {
      loadScenariosHeldCount(profile.id);
    }
  }, [profile?.id, loadScenariosHeldCount]);

  // Cargar datos adicionales según tab
  const loadTabData = useCallback(async () => {
    if (!profile?.id) return;

    if (activeTab === 'stolen' && stolenScenarios.length === 0) {
      // Obtener escenarios robados desde scenario_steal_history
      const { data: steals, error } = await supabase
        .from('scenario_steal_history')
        .select(`
          id,
          stolen_at,
          price_paid,
          scenario:scenarios (
            id,
            title,
            category,
            total_pool,
            participant_count,
            status
          ),
          victim:users!scenario_steal_history_victim_id_fkey (
            username
          )
        `)
        .eq('thief_id', profile.id)
        .order('stolen_at', { ascending: false });

      if (error) {
        console.error('Error fetching stolen scenarios:', error);
      }
      setStolenScenarios(steals || []);
    }
    if (activeTab === 'scenarios' && scenarios.length === 0) {
      const data = await publicProfileService.getCreatedScenarios(profile.id);
      setScenarios(data);
    }
    if (activeTab === 'activity' && activity.length === 0) {
      const data = await publicProfileService.getActivity(profile.id);
      setActivity(data);
    }
  }, [profile?.id, activeTab, stolenScenarios.length, scenarios.length, activity.length]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Cargar bookmarks cuando se selecciona la pestaña guardados (solo perfil propio)
  useEffect(() => {
    async function loadBookmarks() {
      if (activeTab !== 'guardados' || !isOwnProfile || !currentUser?.id) return;

      setBookmarksLoading(true);
      try {
        const response = await fetch('/api/forum/bookmarks');
        const data = await response.json();
        if (response.ok && data.posts) {
          setBookmarks(data.posts);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setBookmarksLoading(false);
      }
    }
    loadBookmarks();
  }, [activeTab, isOwnProfile, currentUser?.id]);

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
      <div className="min-h-screen bg-background text-foreground">
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
      <div className="min-h-screen bg-background text-foreground">
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
    <div className="min-h-screen bg-background text-foreground">
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
                  disabled={chatLoading || isBlocked}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title={isBlocked ? 'Usuario bloqueado' : 'Enviar mensaje'}
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                </button>
                
                {/* Menú de opciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                    {/* Compartir */}
                    <DropdownMenuItem 
                      onClick={handleShare}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir perfil
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={handleCopyLink}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar link
                    </DropdownMenuItem>
                    
                    <div className="my-1 h-px bg-gray-800" />
                    
                    {/* Silenciar */}
                    <DropdownMenuItem 
                      onClick={handleToggleMute}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      {isMuted ? (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Desilenciar usuario
                        </>
                      ) : (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Silenciar usuario
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    {/* Bloquear */}
                    <DropdownMenuItem 
                      onClick={handleToggleBlock}
                      className={`cursor-pointer ${isBlocked ? 'hover:bg-gray-800' : 'hover:bg-red-500/10 text-red-400'}`}
                    >
                      {isBlocked ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Desbloquear usuario
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Bloquear usuario
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <div className="my-1 h-px bg-gray-800" />
                    
                    {/* Reportar */}
                    <DropdownMenuItem 
                      onClick={() => setShowReportModal(true)}
                      className="cursor-pointer hover:bg-red-500/10 text-red-400"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Reportar usuario
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <button
                onClick={handleOpenFollowers}
                className="text-center hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="text-xl font-bold">{profile.followers_count}</span>
                <span className="text-gray-400 text-sm ml-1">seguidores</span>
              </button>
              <button
                onClick={handleOpenFollowing}
                className="text-center hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="text-xl font-bold">{profile.following_count}</span>
                <span className="text-gray-400 text-sm ml-1">siguiendo</span>
              </button>
              <div className="text-center px-3 py-2">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 sm:px-6 py-6 border-t border-gray-800">
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
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-xl p-4 text-center">
            <Crown className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{scenariosHeldCount}</p>
            <p className="text-sm text-gray-400">Holder Actual</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-800">
          <div className="flex overflow-x-auto px-4 sm:px-6">
            {[
              { id: 'general', label: 'General', icon: User },
              { id: 'stolen', label: 'Escenarios Robados', icon: Skull },
              { id: 'scenarios', label: 'Escenarios', icon: Zap },
              { id: 'activity', label: 'Actividad', icon: Eye },
              ...(isOwnProfile ? [{ id: 'guardados', label: 'Guardados', icon: Bookmark }] : []),
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

          {activeTab === 'stolen' && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                Escenarios Robados
              </h3>
              {stolenScenarios.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Skull className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ha robado escenarios aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stolenScenarios.map((steal) => (
                    <Link
                      key={steal.id}
                      href={`/escenario/${steal.scenario?.id}`}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                          {steal.scenario?.category || 'Sin categoría'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
                          <Skull className="w-3 h-3" />
                          Robado
                        </span>
                      </div>
                      <h4 className="font-medium mt-2 line-clamp-2">{steal.scenario?.title || 'Escenario eliminado'}</h4>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-yellow-500" />
                          {steal.scenario?.total_pool?.toLocaleString() || 0} AP
                        </span>
                        <span>{steal.scenario?.participant_count || 0} participantes</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                        <p>Robado a @{steal.victim?.username || 'desconocido'} por {steal.price_paid} AP</p>
                        <p>{formatDistanceToNow(new Date(steal.stolen_at), { addSuffix: true, locale: es })}</p>
                      </div>
                    </Link>
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

          {activeTab === 'guardados' && isOwnProfile && (
            <div className="space-y-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-400" />
                Publicaciones Guardadas
              </h3>
              {bookmarksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes publicaciones guardadas</p>
                  <p className="text-sm mt-2">Guarda publicaciones del foro haciendo clic en el icono de marcador</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((post) => (
                    <Link
                      key={post.id}
                      href={`/foro?post=${post.id}`}
                      className="block bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {post.author?.avatar_url ? (
                            <img
                              src={post.author.avatar_url}
                              alt={post.author.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {(post.author?.display_name || post.author?.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{post.author?.display_name || post.author?.username}</span>
                            <span className="text-gray-500">@{post.author?.username}</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500 text-sm">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-300 line-clamp-3">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.reactions_count
                                ? Object.values(post.reactions_count).reduce((a, b) => a + b, 0)
                                : 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Reporte */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" />
              Reportar a @{profile.username}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                ¿Por qué quieres reportar a este usuario?
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setReportReason(reason.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      reportReason === reason.id
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Detalles adicionales (opcional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Proporciona más información sobre el problema..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reportDescription.length}/500 caracteres
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="flex-1 border-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReport}
                disabled={!reportReason || reportLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {reportLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar reporte'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seguidores */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Seguidores de @{profile?.username}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{profile?.followers_count} seguidores</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {loadingFollowers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : followersList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aún no tiene seguidores</p>
              </div>
            ) : (
              followersList.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/perfil/${follower.username}`}
                  onClick={() => setShowFollowersModal(false)}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    {follower.avatar_url ? (
                      <img src={follower.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate flex items-center gap-1">
                      {follower.display_name || follower.username}
                      {follower.is_verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      {follower.is_premium && <Crown className="w-4 h-4 text-yellow-400" />}
                    </p>
                    <p className="text-sm text-gray-400 truncate">@{follower.username}</p>
                  </div>
                  <span className="text-xs text-gray-500">Nivel {follower.level}</span>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Siguiendo */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              @{profile?.username} sigue a
            </h2>
            <p className="text-sm text-gray-400 mt-1">{profile?.following_count} siguiendo</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {loadingFollowing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : followingList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sigue a nadie todavía</p>
              </div>
            ) : (
              followingList.map((following) => (
                <Link
                  key={following.id}
                  href={`/perfil/${following.username}`}
                  onClick={() => setShowFollowingModal(false)}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    {following.avatar_url ? (
                      <img src={following.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate flex items-center gap-1">
                      {following.display_name || following.username}
                      {following.is_verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      {following.is_premium && <Crown className="w-4 h-4 text-yellow-400" />}
                    </p>
                    <p className="text-sm text-gray-400 truncate">@{following.username}</p>
                  </div>
                  <span className="text-xs text-gray-500">Nivel {following.level}</span>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}