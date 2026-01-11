'use client';

import { useState, useEffect } from 'react';
import {
  useLocalParticipant,
  useRoomContext,
  useMediaDeviceSelect,
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
  X,
  Camera,
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
  const [showSettings, setShowSettings] = useState(false);

  // Device selection hooks
  const {
    devices: videoDevices,
    activeDeviceId: activeVideoDevice,
    setActiveMediaDevice: setActiveVideoDevice,
  } = useMediaDeviceSelect({ kind: 'videoinput' });

  const {
    devices: audioDevices,
    activeDeviceId: activeAudioDevice,
    setActiveMediaDevice: setActiveAudioDevice,
  } = useMediaDeviceSelect({ kind: 'audioinput' });

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
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50" />

            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Configuración</h2>
                      <p className="text-sm text-gray-400">Ajusta tu audio y video</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Camera Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Camera className="w-4 h-4 text-purple-400" />
                    Cámara
                  </label>
                  <select
                    value={activeVideoDevice || ''}
                    onChange={(e) => setActiveVideoDevice(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Cámara ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  {videoDevices.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">No se encontraron cámaras</p>
                  )}
                </div>

                {/* Microphone Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Mic className="w-4 h-4 text-blue-400" />
                    Micrófono
                  </label>
                  <select
                    value={activeAudioDevice || ''}
                    onChange={(e) => setActiveAudioDevice(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Micrófono ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  {audioDevices.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">No se encontraron micrófonos</p>
                  )}
                </div>

                {/* Info */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-xs text-gray-400">
                    Los cambios se aplican en tiempo real. Si no ves tus dispositivos,
                    asegúrate de haber dado permisos al navegador.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            onClick={() => setShowSettings(true)}
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
    </>
  );
}
