// src/services/content.service.ts
// Content Service - Reels, Audio Posts, Live Streams

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==================== TYPES ====================

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration: number;
  width: number;
  height: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
  user_has_liked?: boolean;
}

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  replies?: ReelComment[];
}

export interface AudioPost {
  id: string;
  user_id: string;
  audio_url: string;
  title: string;
  description: string;
  duration: number;
  waveform_data: number[];
  plays_count: number;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
  user_has_liked?: boolean;
}

export interface LiveStream {
  id: string;
  user_id: string;
  community_id: string | null;
  title: string;
  description: string;
  thumbnail_url: string;
  stream_key: string;
  stream_url: string;
  playback_url: string;
  status: 'offline' | 'live' | 'ended';
  viewers_count: number;
  peak_viewers: number;
  total_views: number;
  likes_count: number;
  started_at: string | null;
  ended_at: string | null;
  duration: number;
  is_recorded: boolean;
  recording_url: string | null;
  category: string;
  tags: string[];
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

export interface StreamChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  is_highlighted: boolean;
  highlight_amount: number;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

// ==================== SERVICE ====================

export const contentService = {
  // ============================================
  // REELS
  // ============================================

  async getReels(options: {
    userId?: string;
    tag?: string;
    following?: boolean;
    currentUserId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Reel[]> {
    let query = supabase
      .from('user_reels')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('is_published', true);

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }

    if (options.following && options.currentUserId) {
      // Get followed users
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', options.currentUserId);

      const followingIds = follows?.map(f => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      }
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options.limit || 20);

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) return [];

    // Check if current user liked each reel
    if (options.currentUserId && data) {
      const reelIds = data.map(r => r.id);
      const { data: likes } = await supabase
        .from('reel_likes')
        .select('reel_id')
        .eq('user_id', options.currentUserId)
        .in('reel_id', reelIds);

      const likedReelIds = new Set(likes?.map(l => l.reel_id) || []);

      return data.map(reel => ({
        ...reel,
        user_has_liked: likedReelIds.has(reel.id)
      }));
    }

    return data || [];
  },

  async getReelById(reelId: string, currentUserId?: string): Promise<Reel | null> {
    const { data, error } = await supabase
      .from('user_reels')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('id', reelId)
      .single();

    if (error) return null;

    if (currentUserId) {
      const { data: like } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('reel_id', reelId)
        .eq('user_id', currentUserId)
        .single();

      return { ...data, user_has_liked: !!like };
    }

    return data;
  },

  async createReel(data: {
    userId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    duration: number;
    width?: number;
    height?: number;
    tags?: string[];
  }): Promise<{ success: boolean; reel?: Reel; error?: string }> {
    const { data: reel, error } = await supabase
      .from('user_reels')
      .insert({
        user_id: data.userId,
        video_url: data.videoUrl,
        thumbnail_url: data.thumbnailUrl,
        caption: data.caption,
        duration: data.duration,
        width: data.width,
        height: data.height,
        tags: data.tags || []
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reel };
  },

  async deleteReel(reelId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_reels')
      .delete()
      .eq('id', reelId)
      .eq('user_id', userId);

    return !error;
  },

  async likeReel(reelId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('reel_likes')
      .insert({ reel_id: reelId, user_id: userId });

    if (!error) {
      // Increment likes count
      try {
        await supabase.rpc('increment', {
          row_id: reelId,
          table_name: 'user_reels',
          column_name: 'likes_count'
        });
      } catch {
        // Ignore
      }
    }

    return !error;
  },

  async unlikeReel(reelId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('reel_likes')
      .delete()
      .eq('reel_id', reelId)
      .eq('user_id', userId);

    if (!error) {
      // Decrement likes count
      try {
        await supabase.rpc('decrement', {
          row_id: reelId,
          table_name: 'user_reels',
          column_name: 'likes_count'
        });
      } catch {
        // Ignore
      }
    }

    return !error;
  },

  async incrementReelViews(reelId: string): Promise<void> {
    try {
      await supabase.rpc('increment', {
        row_id: reelId,
        table_name: 'user_reels',
        column_name: 'views_count'
      });
    } catch {
      // Ignore
    }
  },

  async getReelComments(reelId: string): Promise<ReelComment[]> {
    const { data, error } = await supabase
      .from('reel_comments')
      .select('*, user:users(id, username, avatar_url)')
      .eq('reel_id', reelId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) return [];

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('reel_comments')
          .select('*, user:users(id, username, avatar_url)')
          .eq('parent_id', comment.id)
          .order('created_at');

        return { ...comment, replies: replies || [] };
      })
    );

    return commentsWithReplies;
  },

  async addReelComment(reelId: string, userId: string, content: string, parentId?: string): Promise<ReelComment | null> {
    const { data, error } = await supabase
      .from('reel_comments')
      .insert({
        reel_id: reelId,
        user_id: userId,
        content,
        parent_id: parentId || null
      })
      .select('*, user:users(id, username, avatar_url)')
      .single();

    if (!error) {
      // Increment comments count
      try {
        await supabase.rpc('increment', {
          row_id: reelId,
          table_name: 'user_reels',
          column_name: 'comments_count'
        });
      } catch {
        // Ignore
      }
    }

    return data;
  },

  // ============================================
  // AUDIO POSTS
  // ============================================

  async getAudioPosts(options: {
    userId?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AudioPost[]> {
    let query = supabase
      .from('user_audio_posts')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('is_published', true);

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options.limit || 20);

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getAudioPostById(audioId: string): Promise<AudioPost | null> {
    const { data, error } = await supabase
      .from('user_audio_posts')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('id', audioId)
      .single();

    if (error) return null;
    return data;
  },

  async createAudioPost(data: {
    userId: string;
    audioUrl: string;
    title: string;
    description?: string;
    duration: number;
    waveformData?: number[];
    tags?: string[];
  }): Promise<{ success: boolean; audioPost?: AudioPost; error?: string }> {
    const { data: audioPost, error } = await supabase
      .from('user_audio_posts')
      .insert({
        user_id: data.userId,
        audio_url: data.audioUrl,
        title: data.title,
        description: data.description,
        duration: data.duration,
        waveform_data: data.waveformData,
        tags: data.tags || []
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, audioPost };
  },

  async deleteAudioPost(audioId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_audio_posts')
      .delete()
      .eq('id', audioId)
      .eq('user_id', userId);

    return !error;
  },

  async incrementAudioPlays(audioId: string): Promise<void> {
    try {
      await supabase.rpc('increment', {
        row_id: audioId,
        table_name: 'user_audio_posts',
        column_name: 'plays_count'
      });
    } catch {
      // Ignore
    }
  },

  // ============================================
  // LIVE STREAMS
  // ============================================

  async getLiveStreams(options: {
    status?: LiveStream['status'];
    category?: string;
    userId?: string;
    limit?: number;
  } = {}): Promise<LiveStream[]> {
    let query = supabase
      .from('live_streams')
      .select('*, user:users(id, username, avatar_url, level)');

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.status === 'live') {
      query = query.order('viewers_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getStreamById(streamId: string): Promise<LiveStream | null> {
    const { data, error } = await supabase
      .from('live_streams')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('id', streamId)
      .single();

    if (error) return null;
    return data;
  },

  async createStream(data: {
    userId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    category?: string;
    tags?: string[];
    communityId?: string;
  }): Promise<{ success: boolean; stream?: LiveStream; error?: string }> {
    // Generate stream key
    const streamKey = `sk_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert({
        user_id: data.userId,
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnailUrl,
        stream_key: streamKey,
        category: data.category,
        tags: data.tags || [],
        community_id: data.communityId
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, stream };
  },

  async startStream(streamId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('live_streams')
      .update({
        status: 'live',
        started_at: new Date().toISOString()
      })
      .eq('id', streamId)
      .eq('user_id', userId);

    return !error;
  },

  async endStream(streamId: string, userId: string): Promise<boolean> {
    const { data: stream } = await supabase
      .from('live_streams')
      .select('started_at')
      .eq('id', streamId)
      .single();

    const duration = stream?.started_at
      ? Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000)
      : 0;

    const { error } = await supabase
      .from('live_streams')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration
      })
      .eq('id', streamId)
      .eq('user_id', userId);

    return !error;
  },

  async joinStream(streamId: string, userId: string): Promise<void> {
    // Record viewer
    await supabase
      .from('stream_viewers')
      .upsert({
        stream_id: streamId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }, { onConflict: 'stream_id,user_id' });

    // Increment viewers
    try {
      await supabase.rpc('increment', {
        row_id: streamId,
        table_name: 'live_streams',
        column_name: 'viewers_count'
      });
    } catch {
      // Ignore
    }
  },

  async leaveStream(streamId: string, userId: string): Promise<void> {
    // Update watch time
    const { data: viewer } = await supabase
      .from('stream_viewers')
      .select('joined_at')
      .eq('stream_id', streamId)
      .eq('user_id', userId)
      .single();

    if (viewer) {
      const watchTime = Math.floor((Date.now() - new Date(viewer.joined_at).getTime()) / 1000);

      await supabase
        .from('stream_viewers')
        .update({
          left_at: new Date().toISOString(),
          watch_time: watchTime
        })
        .eq('stream_id', streamId)
        .eq('user_id', userId);
    }

    // Decrement viewers
    try {
      await supabase.rpc('decrement', {
        row_id: streamId,
        table_name: 'live_streams',
        column_name: 'viewers_count'
      });
    } catch {
      // Ignore
    }
  },

  async getStreamChat(streamId: string, limit: number = 100): Promise<StreamChatMessage[]> {
    const { data, error } = await supabase
      .from('stream_chat_messages')
      .select('*, user:users(id, username, avatar_url)')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).reverse();
  },

  async sendStreamMessage(
    streamId: string,
    userId: string,
    content: string,
    highlightAmount?: number
  ): Promise<StreamChatMessage | null> {
    const { data, error } = await supabase
      .from('stream_chat_messages')
      .insert({
        stream_id: streamId,
        user_id: userId,
        content,
        is_highlighted: !!highlightAmount,
        highlight_amount: highlightAmount || 0
      })
      .select('*, user:users(id, username, avatar_url)')
      .single();

    if (error) return null;

    // If highlighted, deduct AP coins
    if (highlightAmount && highlightAmount > 0) {
      await supabase.rpc('log_ap_transaction', {
        p_user_id: userId,
        p_amount: -highlightAmount,
        p_type: 'stream_highlight',
        p_description: 'Highlighted message in stream',
        p_reference_id: streamId
      });
    }

    return data;
  },

  async pinStreamMessage(messageId: string, streamOwnerId: string): Promise<boolean> {
    // Verify stream owner
    const { data: message } = await supabase
      .from('stream_chat_messages')
      .select('stream_id, live_streams!inner(user_id)')
      .eq('id', messageId)
      .single();

    if (!message || (message as any).live_streams?.user_id !== streamOwnerId) {
      return false;
    }

    const { error } = await supabase
      .from('stream_chat_messages')
      .update({ is_pinned: true })
      .eq('id', messageId);

    return !error;
  },

  // ============================================
  // TRENDING TAGS
  // ============================================

  async getTrendingTags(contentType: 'reels' | 'audio' | 'all', limit: number = 10): Promise<string[]> {
    // This is a simplified version - in production you'd use a more sophisticated algorithm
    let data: any[] = [];

    if (contentType === 'reels' || contentType === 'all') {
      const { data: reels } = await supabase
        .from('user_reels')
        .select('tags')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      data = [...data, ...(reels || [])];
    }

    if (contentType === 'audio' || contentType === 'all') {
      const { data: audio } = await supabase
        .from('user_audio_posts')
        .select('tags')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      data = [...data, ...(audio || [])];
    }

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    data.forEach(item => {
      (item.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count and return top tags
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  }
};
