'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Radio, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveKitRoom } from '@/components/streaming/LiveKitRoom';
import { useAuthStore } from '@/lib/stores';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface StreamInfo {
  id: string;
  title: string;
  description?: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: 'offline' | 'live' | 'ended';
  viewersCount: number;
  likesCount: number;
  category?: string;
  startedAt?: string;
}

export default function LiveStreamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuthStore();
  const { data: session, status } = useSession();

  // Get current user ID from NextAuth session or Zustand
  const currentUserId = user?.id || session?.user?.id;

  // Get streamId from params
  const streamId = params.id as string;

  // Check if user is host from URL param
  const hostParam = searchParams.get('host') === 'true';

  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(hostParam);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stream info and get token
  useEffect(() => {
    if (!streamId) return;

    const loadStream = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get stream info
        const infoResponse = await fetch(`/api/streaming/${streamId}`);
        const infoData = await infoResponse.json();

        if (infoData.error) {
          throw new Error(infoData.error);
        }

        setStreamInfo(infoData.stream);

        // Check if stream has ended
        if (infoData.stream.status === 'ended') {
          setError('Este stream ha terminado');
          setIsLoading(false);
          return;
        }

        // Get LiveKit token - owner is always host regardless of URL param
        const isOwner = currentUserId === infoData.stream.userId;
        const wantsToHost = isOwner; // Owner is automatically host
        console.log('Token request:', { streamId, hostParam, userId: currentUserId, streamUserId: infoData.stream.userId, isOwner, wantsToHost });

        const tokenResponse = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            isHost: wantsToHost,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          throw new Error(tokenData.error);
        }

        setToken(tokenData.token);
        setIsHost(tokenData.isHost);

        // Get LiveKit URL from environment
        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
        if (!livekitUrl) {
          throw new Error('LiveKit no está configurado. Contacta al administrador.');
        }
        setServerUrl(livekitUrl);
      } catch (err) {
        console.error('Error loading stream:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el stream');
      } finally {
        setIsLoading(false);
      }
    };

    loadStream();
  }, [streamId, hostParam, currentUserId]);

  const handleStreamEnd = () => {
    toast.success('Stream finalizado');
    router.push('/streaming');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Conectando al stream...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/streaming')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a streams
          </Button>
        </div>
      </div>
    );
  }

  // Not configured state
  if (!token || !serverUrl) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Radio className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">LiveKit no configurado</h2>
          <p className="text-gray-400 mb-4">
            El streaming en vivo requiere configurar LiveKit.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left text-sm mb-6">
            <p className="text-gray-300 mb-2">Agrega estas variables a tu .env.local:</p>
            <code className="text-green-400 text-xs block">
              NEXT_PUBLIC_LIVEKIT_URL=wss://your-app.livekit.cloud<br />
              LIVEKIT_API_KEY=your-api-key<br />
              LIVEKIT_API_SECRET=your-api-secret
            </code>
          </div>
          <Button onClick={() => router.push('/streaming')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/streaming')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{streamInfo?.title || 'Stream en vivo'}</h1>
              <p className="text-sm text-gray-400">
                {streamInfo?.displayName || streamInfo?.username}
                {isHost && <span className="text-purple-400 ml-2">(Host)</span>}
              </p>
            </div>
          </div>

          {isHost && (
            <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1 rounded-lg border border-red-500/30">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400">Transmitiendo</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <LiveKitRoom
          streamId={streamId}
          isHost={isHost}
          token={token}
          serverUrl={serverUrl}
          streamTitle={streamInfo?.title || 'Stream'}
          onStreamEnd={handleStreamEnd}
        />
      </div>
    </div>
  );
}
