'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LiveKitRoom as LKRoom,
  VideoTrack,
  AudioTrack,
  useParticipants,
  useTracks,
  useRoomContext,
  useDataChannel,
} from '@livekit/components-react';
import { Track, RoomEvent, DataPacket_Kind } from 'livekit-client';
import '@livekit/components-styles';
import { Radio, Users, MessageSquare, AlertCircle } from 'lucide-react';
import { StreamControls } from './StreamControls';
import { LiveKitChat } from './LiveKitChat';

interface LiveKitRoomProps {
  streamId: string;
  isHost: boolean;
  token: string;
  serverUrl: string;
  streamTitle: string;
  onStreamEnd?: () => void;
}

// Component to display the main video
function VideoDisplay({ isHost }: { isHost: boolean }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const participants = useParticipants();

  // Find the host's video track (camera or screen share)
  const hostTrack = tracks.find(
    (track) => track.participant.permissions?.canPublish
  );

  if (!hostTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">
            {isHost ? 'Haz clic en la cámara para comenzar a transmitir' : 'Esperando al streamer...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <VideoTrack
        trackRef={hostTrack}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// Component to handle audio
function AudioHandler() {
  const tracks = useTracks([Track.Source.Microphone]);

  return (
    <>
      {tracks.map((track) => (
        <AudioTrack key={track.participant.sid} trackRef={track} />
      ))}
    </>
  );
}

// Viewer count display
function ViewerCount() {
  const participants = useParticipants();
  return (
    <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
      <Users className="w-4 h-4" />
      {participants.length}
    </div>
  );
}

// Main room content
function RoomContent({
  isHost,
  streamTitle,
  streamId,
  onStreamEnd
}: {
  isHost: boolean;
  streamTitle: string;
  streamId: string;
  onStreamEnd?: () => void;
}) {
  const [showChat, setShowChat] = useState(true);
  const room = useRoomContext();
  // Track if onStreamEnd has been called to prevent duplicates
  const endCalledRef = useRef(false);

  // Handle stream end - only call once (deduplicates multiple triggers)
  const handleStreamEndOnce = useCallback(() => {
    if (!endCalledRef.current && onStreamEnd) {
      endCalledRef.current = true;
      onStreamEnd();
    }
  }, [onStreamEnd]);

  // Handle room disconnect
  useEffect(() => {
    const handleDisconnect = () => {
      // Always call handleStreamEndOnce - it will deduplicate internally
      handleStreamEndOnce();
    };

    room.on(RoomEvent.Disconnected, handleDisconnect);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnect);
    };
  }, [room, handleStreamEndOnce]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 bg-black rounded-xl overflow-hidden min-h-[300px] lg:min-h-[500px]">
          {/* Video */}
          <VideoDisplay isHost={isHost} />
          <AudioHandler />

          {/* Overlay Info */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded-lg text-sm font-bold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              EN VIVO
            </span>
            <ViewerCount />
          </div>

          {/* Stream Title */}
          <div className="absolute top-4 right-4 max-w-[50%]">
            <h2 className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium truncate">
              {streamTitle}
            </h2>
          </div>

          {/* Toggle Chat Button (Mobile) */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="lg:hidden absolute bottom-4 right-4 bg-purple-600 p-3 rounded-full shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="mt-4">
            <StreamControls streamId={streamId} onEndStream={handleStreamEndOnce} />
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className={`lg:w-80 xl:w-96 ${showChat ? 'block' : 'hidden lg:block'}`}>
        <LiveKitChat streamId={streamId} />
      </div>
    </div>
  );
}

export function LiveKitRoom({
  streamId,
  isHost,
  token,
  serverUrl,
  streamTitle,
  onStreamEnd,
}: LiveKitRoomProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-900 rounded-xl">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error de conexión</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <LKRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={isHost}
      audio={isHost}
      onError={(err) => {
        console.error('LiveKit error:', err);
        setError(err.message || 'Error al conectar con el stream');
      }}
      data-lk-theme="default"
      className="h-full"
    >
      <RoomContent
        isHost={isHost}
        streamTitle={streamTitle}
        streamId={streamId}
        onStreamEnd={onStreamEnd}
      />
    </LKRoom>
  );
}
