import { AccessToken, TrackSource } from 'livekit-server-sdk';

// LiveKit configuration
export const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

export interface TokenOptions {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  isHost?: boolean;
}

/**
 * Generate a LiveKit access token for a participant
 */
export async function generateToken(options: TokenOptions): Promise<string> {
  const { roomName, participantName, participantIdentity, isHost = false } = options;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit API credentials not configured');
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: '6h', // Token valid for 6 hours
  });

  // Grant permissions based on role
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isHost, // Only hosts can publish video/audio
    canSubscribe: true, // Everyone can view
    canPublishData: true, // Everyone can send chat messages
    canPublishSources: isHost ? [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE] : [],
  });

  return await token.toJwt();
}

/**
 * Create a unique room name from stream ID
 */
export function createRoomName(streamId: string): string {
  return `stream-${streamId}`;
}

/**
 * Check if LiveKit is properly configured
 */
export function isLiveKitConfigured(): boolean {
  return Boolean(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}
