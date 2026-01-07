'use client';

import { useState } from 'react';
import {
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface StreamControlsProps {
  streamId: string;
  onEndStream?: () => void;
}

export function StreamControls({ streamId, onEndStream }: StreamControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const isCameraEnabled = localParticipant?.isCameraEnabled;
  const isMicEnabled = localParticipant?.isMicrophoneEnabled;

  const toggleCamera = async () => {
    try {
      await localParticipant?.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Error al cambiar cámara');
    }
  };

  const toggleMic = async () => {
    try {
      await localParticipant?.setMicrophoneEnabled(!isMicEnabled);
    } catch (error) {
      console.error('Error toggling mic:', error);
      toast.error('Error al cambiar micrófono');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await localParticipant?.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await localParticipant?.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Error al compartir pantalla');
    }
  };

  const endStream = async () => {
    setIsEnding(true);
    try {
      // Update stream status in database
      await fetch(`/api/streaming/${streamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });

      // Disconnect from room
      await room.disconnect();

      toast.success('Stream finalizado');

      if (onEndStream) {
        onEndStream();
      }
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Error al finalizar stream');
    } finally {
      setIsEnding(false);
      setShowEndConfirm(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Media Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className={`border-gray-700 ${
              isCameraEnabled
                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                : 'bg-red-600/20 border-red-500 text-red-400'
            }`}
            title={isCameraEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            {isCameraEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleMic}
            className={`border-gray-700 ${
              isMicEnabled
                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                : 'bg-red-600/20 border-red-500 text-red-400'
            }`}
            title={isMicEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {isMicEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleScreenShare}
            className={`border-gray-700 ${
              isScreenSharing
                ? 'bg-green-600/20 border-green-500 text-green-400'
                : ''
            }`}
            title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </Button>

          <div className="w-px h-8 bg-gray-700 mx-2" />

          <Button
            variant="outline"
            size="icon"
            className="border-gray-700"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* End Stream Button */}
        {showEndConfirm ? (
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">¿Seguro que quieres terminar?</span>
            <Button
              size="sm"
              onClick={endStream}
              disabled={isEnding}
              className="bg-red-600 hover:bg-red-700"
            >
              {isEnding ? 'Finalizando...' : 'Sí, terminar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEndConfirm(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowEndConfirm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Terminar stream
          </Button>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          Cámara {isCameraEnabled ? 'activa' : 'inactiva'}
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          Micrófono {isMicEnabled ? 'activo' : 'inactivo'}
        </div>
        {isScreenSharing && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Compartiendo pantalla
          </div>
        )}
      </div>
    </div>
  );
}
