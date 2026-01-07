import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateToken, createRoomName, isLiveKitConfigured } from '@/lib/livekit';

interface StreamRow {
  id: string;
  user_id: string;
  status: string;
}

interface ProfileRow {
  username: string;
  display_name: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Check if LiveKit is configured
    if (!isLiveKitConfigured()) {
      return NextResponse.json(
        { error: 'LiveKit not configured. Please add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to your environment.' },
        { status: 503 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { streamId, isHost } = await request.json();

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 });
    }

    // Get stream info to verify it exists
    const { data: streamData, error: streamError } = await supabase
      .from('live_streams')
      .select('id, user_id, status')
      .eq('id', streamId)
      .single();

    const stream = streamData as StreamRow | null;

    if (streamError || !stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Verify host permission
    const requestingHost = isHost && stream.user_id === user.id;

    // Get user profile for display name
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single();

    const profile = profileData as ProfileRow | null;
    const participantName = profile?.display_name || profile?.username || 'Anonymous';
    const roomName = createRoomName(streamId);

    // Generate token
    const token = await generateToken({
      roomName,
      participantName,
      participantIdentity: user.id,
      isHost: requestingHost,
    });

    return NextResponse.json({
      token,
      roomName,
      isHost: requestingHost,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
