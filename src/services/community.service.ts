// src/services/community.service.ts
// Community Service - Groups, Events, Tournaments

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==================== TYPES ====================

export type CommunityRole = 'member' | 'moderator' | 'admin' | 'owner';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  banner_url: string;
  theme_color: string;
  creator_id: string;
  is_public: boolean;
  is_verified: boolean;
  requires_approval: boolean;
  members_count: number;
  posts_count: number;
  rules: string[];
  categories: string[];
  created_at: string;
  creator?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  is_banned: boolean;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  creator_id: string;
  title: string;
  description: string;
  event_type: 'general' | 'prediction_contest' | 'ama' | 'live_stream';
  image_url: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  participants_count: number;
  is_cancelled: boolean;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  creator_id: string;
  community_id: string;
  tournament_type: 'open' | 'invite_only' | 'community';
  category_id: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  participants_count: number;
  min_predictions: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  rules: Record<string, any>;
  prizes: any[];
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  predictions_made: number;
  correct_predictions: number;
  accuracy: number;
  points: number;
  rank: number;
  prize_won: number;
  joined_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
    level: number;
  };
}

// ==================== SERVICE ====================

export const communityService = {
  // ============================================
  // COMMUNITIES
  // ============================================

  async getCommunities(options: {
    search?: string;
    category?: string;
    sort?: 'popular' | 'new' | 'active';
    limit?: number;
    offset?: number;
  } = {}): Promise<Community[]> {
    let query = supabase
      .from('communities')
      .select('*, creator:users!communities_creator_id_fkey(id, username, avatar_url)')
      .eq('is_public', true);

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options.category) {
      query = query.contains('categories', [options.category]);
    }

    switch (options.sort) {
      case 'popular':
        query = query.order('members_count', { ascending: false });
        break;
      case 'active':
        query = query.order('posts_count', { ascending: false });
        break;
      case 'new':
      default:
        query = query.order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getCommunityBySlug(slug: string): Promise<Community | null> {
    const { data, error } = await supabase
      .from('communities')
      .select('*, creator:users!communities_creator_id_fkey(id, username, avatar_url)')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  },

  async getCommunityById(id: string): Promise<Community | null> {
    const { data, error } = await supabase
      .from('communities')
      .select('*, creator:users!communities_creator_id_fkey(id, username, avatar_url)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async createCommunity(data: {
    name: string;
    description: string;
    creatorId: string;
    isPublic?: boolean;
    categories?: string[];
    iconUrl?: string;
    themeColor?: string;
  }): Promise<{ success: boolean; community?: Community; error?: string }> {
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return { success: false, error: 'Community name already taken' };
    }

    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name: data.name,
        slug,
        description: data.description,
        creator_id: data.creatorId,
        is_public: data.isPublic ?? true,
        categories: data.categories || [],
        icon_url: data.iconUrl,
        theme_color: data.themeColor || '#6366f1'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Add creator as owner
    await supabase
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: data.creatorId,
        role: 'owner'
      });

    return { success: true, community };
  },

  async updateCommunity(
    communityId: string,
    data: Partial<{
      name: string;
      description: string;
      icon_url: string;
      banner_url: string;
      theme_color: string;
      is_public: boolean;
      requires_approval: boolean;
      rules: string[];
      categories: string[];
    }>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('communities')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', communityId);

    return !error;
  },

  async deleteCommunity(communityId: string): Promise<boolean> {
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId);

    return !error;
  },

  // ============================================
  // MEMBERSHIP
  // ============================================

  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const { data: community } = await supabase
      .from('communities')
      .select('requires_approval')
      .eq('id', communityId)
      .single();

    if (!community) {
      return { success: false, error: 'Community not found' };
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('community_members')
      .select('id, is_banned')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.is_banned) {
        return { success: false, error: 'You are banned from this community' };
      }
      return { success: false, error: 'Already a member' };
    }

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        role: 'member'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Increment members count
    try {
      await supabase.rpc('increment', {
        row_id: communityId,
        table_name: 'communities',
        column_name: 'members_count'
      });
    } catch {
      // Ignore errors
    }

    return { success: true };
  },

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    // Check if owner - owners can't leave
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (member?.role === 'owner') {
      return false; // Owner must transfer ownership first
    }

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (!error) {
      // Decrement members count
      try {
        await supabase.rpc('decrement', {
          row_id: communityId,
          table_name: 'communities',
          column_name: 'members_count'
        });
      } catch {
        // Ignore errors
      }
    }

    return !error;
  },

  async getCommunityMembers(communityId: string, limit: number = 50): Promise<CommunityMember[]> {
    const { data, error } = await supabase
      .from('community_members')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('community_id', communityId)
      .eq('is_banned', false)
      .order('role')
      .order('joined_at')
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  async getUserCommunities(userId: string): Promise<Community[]> {
    const { data, error } = await supabase
      .from('community_members')
      .select('community:communities(*)')
      .eq('user_id', userId)
      .eq('is_banned', false);

    if (error) return [];
    return data?.map(d => (d as any).community as Community).filter(Boolean) || [];
  },

  async getMemberRole(communityId: string, userId: string): Promise<CommunityRole | null> {
    const { data } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    return data?.role || null;
  },

  async updateMemberRole(
    communityId: string,
    userId: string,
    newRole: CommunityRole
  ): Promise<boolean> {
    const { error } = await supabase
      .from('community_members')
      .update({ role: newRole })
      .eq('community_id', communityId)
      .eq('user_id', userId);

    return !error;
  },

  async banMember(
    communityId: string,
    userId: string,
    reason: string,
    until?: Date
  ): Promise<boolean> {
    const { error } = await supabase
      .from('community_members')
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_until: until?.toISOString() || null
      })
      .eq('community_id', communityId)
      .eq('user_id', userId);

    return !error;
  },

  async unbanMember(communityId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('community_members')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_until: null
      })
      .eq('community_id', communityId)
      .eq('user_id', userId);

    return !error;
  },

  // ============================================
  // EVENTS
  // ============================================

  async getCommunityEvents(communityId: string): Promise<CommunityEvent[]> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*, creator:users!community_events_creator_id_fkey(id, username, avatar_url)')
      .eq('community_id', communityId)
      .eq('is_cancelled', false)
      .gte('end_time', new Date().toISOString())
      .order('start_time');

    if (error) return [];
    return data || [];
  },

  async getUpcomingEvents(limit: number = 10): Promise<CommunityEvent[]> {
    const { data, error } = await supabase
      .from('community_events')
      .select('*, creator:users!community_events_creator_id_fkey(id, username, avatar_url), community:communities(name, slug)')
      .eq('is_cancelled', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  async createEvent(data: {
    communityId: string;
    creatorId: string;
    title: string;
    description: string;
    eventType: CommunityEvent['event_type'];
    startTime: Date;
    endTime?: Date;
    imageUrl?: string;
    location?: string;
    maxParticipants?: number;
  }): Promise<{ success: boolean; event?: CommunityEvent; error?: string }> {
    const { data: event, error } = await supabase
      .from('community_events')
      .insert({
        community_id: data.communityId,
        creator_id: data.creatorId,
        title: data.title,
        description: data.description,
        event_type: data.eventType,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime?.toISOString(),
        image_url: data.imageUrl,
        location: data.location,
        max_participants: data.maxParticipants
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, event };
  },

  async joinEvent(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const { data: event } = await supabase
      .from('community_events')
      .select('max_participants, participants_count')
      .eq('id', eventId)
      .single();

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    if (event.max_participants && event.participants_count >= event.max_participants) {
      return { success: false, error: 'Event is full' };
    }

    const { error } = await supabase
      .from('event_participants')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status: 'going'
      }, { onConflict: 'event_id,user_id' });

    if (error) {
      return { success: false, error: error.message };
    }

    // Increment participants
    await supabase
      .from('community_events')
      .update({ participants_count: event.participants_count + 1 })
      .eq('id', eventId);

    return { success: true };
  },

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    return !error;
  },

  // ============================================
  // TOURNAMENTS
  // ============================================

  async getTournaments(options: {
    status?: Tournament['status'];
    communityId?: string;
    limit?: number;
  } = {}): Promise<Tournament[]> {
    let query = supabase
      .from('prediction_tournaments')
      .select('*');

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.communityId) {
      query = query.eq('community_id', options.communityId);
    }

    query = query.order('start_date', { ascending: options.status === 'upcoming' });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  async getTournamentById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('prediction_tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async getTournamentLeaderboard(tournamentId: string): Promise<TournamentParticipant[]> {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('*, user:users(id, username, avatar_url, level)')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false })
      .order('accuracy', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async joinTournament(tournamentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const { data: tournament } = await supabase
      .from('prediction_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    if (tournament.status !== 'upcoming' && tournament.status !== 'active') {
      return { success: false, error: 'Tournament is not open for registration' };
    }

    if (tournament.max_participants && tournament.participants_count >= tournament.max_participants) {
      return { success: false, error: 'Tournament is full' };
    }

    // Check entry fee
    if (tournament.entry_fee > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('ap_coins')
        .eq('id', userId)
        .single();

      if (!user || user.ap_coins < tournament.entry_fee) {
        return { success: false, error: 'Not enough AP Coins for entry fee' };
      }

      // Deduct entry fee
      await supabase.rpc('log_ap_transaction', {
        p_user_id: userId,
        p_amount: -tournament.entry_fee,
        p_type: 'tournament_entry',
        p_description: `Tournament entry: ${tournament.name}`,
        p_reference_id: tournamentId
      });

      // Add to prize pool
      await supabase
        .from('prediction_tournaments')
        .update({ prize_pool: tournament.prize_pool + tournament.entry_fee })
        .eq('id', tournamentId);
    }

    const { error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        user_id: userId
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Increment participants
    await supabase
      .from('prediction_tournaments')
      .update({ participants_count: tournament.participants_count + 1 })
      .eq('id', tournamentId);

    return { success: true };
  },

  async getUserTournaments(userId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('tournament:prediction_tournaments(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) return [];
    return data?.map(d => (d as any).tournament as Tournament).filter(Boolean) || [];
  },

  async getUserTournamentStats(tournamentId: string, userId: string): Promise<TournamentParticipant | null> {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }
};
