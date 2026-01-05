// src/app/api/profile/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const session = await auth();

    // Get current user id if logged in
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const { data: currentUser } = await getSupabaseAdmin()
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();
      currentUserId = currentUser?.id || null;
    }

    // Get user profile
    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .select(`
        id,
        username,
        email,
        display_name,
        bio,
        avatar_url,
        banner_url,
        role,
        level,
        experience,
        ap_coins,
        is_verified,
        total_predictions,
        correct_predictions,
        total_earnings,
        current_streak,
        best_streak,
        created_at,
        last_login_at
      `)
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get followers count
    const { count: followersCount } = await getSupabaseAdmin()
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);

    // Get following count
    const { count: followingCount } = await getSupabaseAdmin()
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const { data: followData } = await getSupabaseAdmin()
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id)
        .single();
      isFollowing = !!followData;
    }

    // Get user badges
    const { data: badges } = await getSupabaseAdmin()
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        achievements (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('user_id', user.id)
      .limit(10);

    // Calculate XP to next level
    const xpToNextLevel = user.level * 1000;
    const accuracy = user.total_predictions > 0 
      ? (user.correct_predictions / user.total_predictions * 100).toFixed(1)
      : 0;

    // Get scenarios created count
    const { count: scenariosCreated } = await getSupabaseAdmin()
      .from('scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id);

    const isOwnProfile = currentUserId === user.id;

    const profile = {
      id: user.id,
      username: user.username,
      email: isOwnProfile ? user.email : undefined,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      bannerUrl: user.banner_url,
      role: user.role,
      level: user.level,
      xp: user.experience,
      xpToNextLevel,
      apCoins: isOwnProfile ? user.ap_coins : undefined,
      isVerified: user.is_verified,
      isPremium: false,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      isFollowing,
      stats: {
        totalPredictions: user.total_predictions,
        correctPredictions: user.correct_predictions,
        accuracy: parseFloat(accuracy as string),
        totalEarnings: user.total_earnings,
        totalLosses: 0,
        netProfit: user.total_earnings,
        scenariosCreated: scenariosCreated || 0,
        scenariosWon: 0,
        stealsSuccessful: 0,
        stealsReceived: 0,
        currentStreak: user.current_streak,
        bestStreak: user.best_streak,
        rank: 0,
        percentile: 0,
      },
      customization: {
        avatarFrame: null,
        profileTheme: 'default',
        entryEffect: null,
      },
      badges: (badges || []).map((b: any) => ({
        id: b.achievements?.id || b.id,
        name: b.achievements?.name || 'Badge',
        description: b.achievements?.description || '',
        icon: b.achievements?.icon || '🏆',
        rarity: 'COMMON',
        unlockedAt: b.unlocked_at,
      })),
      activeTitle: null,
      socialLinks: {},
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = params;
    const body = await request.json();

    // Get current user
    const { data: currentUser } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user owns this profile
    const { data: profileUser } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (!profileUser || profileUser.id !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const allowedFields = ['display_name', 'bio', 'avatar_url', 'banner_url'];
    const updates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (body[camelField] !== undefined) {
        updates[field] = body[camelField];
      }
    }

    const { error } = await getSupabaseAdmin()
      .from('users')
      .update(updates)
      .eq('id', currentUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
