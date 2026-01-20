'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Film,
  Mic,
  Radio,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Users,
  Heart,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
  user?: { username: string; avatar_url: string };
}

interface AudioPost {
  id: string;
  user_id: string;
  audio_url: string;
  title: string;
  description: string;
  duration: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  created_at: string;
  user?: { username: string; avatar_url: string };
}

interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: string;
  viewers_count: number;
  peak_viewers: number;
  total_views: number;
  likes_count: number;
  started_at: string;
  ended_at: string;
  duration: number;
  category: string;
  created_at: string;
  user?: { username: string; avatar_url: string };
}

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-red-500/20 text-red-400',
  offline: 'bg-gray-500/20 text-gray-400',
  ended: 'bg-blue-500/20 text-blue-400',
};

export default function AdminContenidoPage() {
  const supabase = getSupabaseBrowser();
  const [reels, setReels] = useState<Reel[]>([]);
  const [audioPosts, setAudioPosts] = useState<AudioPost[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar Reels
      const { data: reelsData } = await supabase
        .from('user_reels')
        .select('*, user:users(username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(100);

      setReels(reelsData || []);

      // Cargar Audio Posts
      const { data: audioData } = await supabase
        .from('audio_posts')
        .select('*, user:users(username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(100);

      setAudioPosts(audioData || []);

      // Cargar Live Streams
      const { data: liveData } = await supabase
        .from('live_streams')
        .select('*, user:users(username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(100);

      setLiveStreams(liveData || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reels actions
  const handleToggleReelPublished = async (reel: Reel) => {
    setActionLoading(reel.id);
    const { error } = await supabase
      .from('user_reels')
      .update({ is_published: !reel.is_published, updated_at: new Date().toISOString() })
      .eq('id', reel.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  const handleDeleteReel = async (reel: Reel) => {
    if (!confirm('¿Eliminar este reel?')) return;

    setActionLoading(reel.id);
    const { error } = await supabase
      .from('user_reels')
      .delete()
      .eq('id', reel.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  // Audio actions
  const handleToggleAudioPublished = async (audio: AudioPost) => {
    setActionLoading(audio.id);
    const { error } = await supabase
      .from('audio_posts')
      .update({ is_published: !audio.is_published, updated_at: new Date().toISOString() })
      .eq('id', audio.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  const handleDeleteAudio = async (audio: AudioPost) => {
    if (!confirm('¿Eliminar este audio post?')) return;

    setActionLoading(audio.id);
    const { error } = await supabase
      .from('audio_posts')
      .delete()
      .eq('id', audio.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  // Live actions
  const handleEndStream = async (stream: LiveStream) => {
    if (!confirm('¿Terminar este live stream?')) return;

    setActionLoading(stream.id);
    const { error } = await supabase
      .from('live_streams')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', stream.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  const handleDeleteStream = async (stream: LiveStream) => {
    if (!confirm('¿Eliminar este stream?')) return;

    setActionLoading(stream.id);
    const { error } = await supabase
      .from('live_streams')
      .delete()
      .eq('id', stream.id);

    if (error) toast.error('Error: ' + error.message);
    else loadData();
    setActionLoading(null);
  };

  // Stats
  const totalReels = reels.length;
  const publishedReels = reels.filter(r => r.is_published).length;
  const totalAudio = audioPosts.length;
  const liveNow = liveStreams.filter(s => s.status === 'live').length;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Contenido"
        subtitle="Modera reels, audio posts y live streams"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Film className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReels}</p>
                <p className="text-xs text-muted-foreground">Reels ({publishedReels} publicados)</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Mic className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAudio}</p>
                <p className="text-xs text-muted-foreground">Audio Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Radio className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{liveNow}</p>
                <p className="text-xs text-muted-foreground">En Vivo Ahora</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Play className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{liveStreams.length}</p>
                <p className="text-xs text-muted-foreground">Total Streams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs defaultValue="reels" className="bg-card border border-border rounded-xl p-6">
            <TabsList className="bg-muted mb-6">
              <TabsTrigger value="reels" className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                Reels ({reels.length})
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Audio ({audioPosts.length})
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Live ({liveStreams.length})
              </TabsTrigger>
            </TabsList>

            {/* Reels Tab */}
            <TabsContent value="reels">
              {reels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reels</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reels.map((reel) => (
                    <div key={reel.id} className="bg-muted/30 rounded-xl overflow-hidden">
                      <div className="relative aspect-[9/16] bg-black">
                        {reel.thumbnail_url ? (
                          <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                          {formatDuration(reel.duration)}
                        </div>
                        {!reel.is_published && (
                          <div className="absolute top-2 left-2 bg-yellow-500 px-2 py-1 rounded text-xs text-black font-medium">
                            No publicado
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {reel.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium">@{reel.user?.username}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {reel.caption || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {reel.views_count}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {reel.likes_count}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {reel.comments_count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reel.created_at), { addSuffix: true, locale: es })}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading === reel.id}>
                                {actionLoading === reel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <PermissionGate permission="admin.content.edit">
                                <DropdownMenuItem onClick={() => handleToggleReelPublished(reel)}>
                                  {reel.is_published ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                  {reel.is_published ? 'Ocultar' : 'Publicar'}
                                </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission="admin.content.delete">
                                <DropdownMenuItem onClick={() => handleDeleteReel(reel)} className="text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </PermissionGate>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio">
              {audioPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay audio posts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {audioPosts.map((audio) => (
                    <div key={audio.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{audio.title || 'Sin título'}</p>
                          {!audio.is_published && (
                            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Oculto</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{audio.user?.username}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(audio.duration)}</span>
                          <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {audio.plays_count}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {audio.likes_count}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === audio.id}>
                            {actionLoading === audio.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionGate permission="admin.content.edit">
                            <DropdownMenuItem onClick={() => handleToggleAudioPublished(audio)}>
                              {audio.is_published ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                              {audio.is_published ? 'Ocultar' : 'Publicar'}
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate permission="admin.content.delete">
                            <DropdownMenuItem onClick={() => handleDeleteAudio(audio)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Live Tab */}
            <TabsContent value="live">
              {liveStreams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay streams</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveStreams.map((stream) => (
                    <div key={stream.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-20 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0 relative">
                        {stream.thumbnail_url ? (
                          <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Radio className="w-6 h-6 text-muted-foreground" />
                        )}
                        {stream.status === 'live' && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{stream.title || 'Sin título'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[stream.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {stream.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">@{stream.user?.username} • {stream.category}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stream.viewers_count} viendo</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {stream.total_views} total</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {stream.likes_count}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === stream.id}>
                            {actionLoading === stream.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {stream.status === 'live' && (
                            <PermissionGate permission="admin.content.edit">
                              <DropdownMenuItem onClick={() => handleEndStream(stream)} className="text-yellow-400">
                                <Radio className="w-4 h-4 mr-2" />
                                Terminar Stream
                              </DropdownMenuItem>
                            </PermissionGate>
                          )}
                          <PermissionGate permission="admin.content.delete">
                            <DropdownMenuItem onClick={() => handleDeleteStream(stream)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
