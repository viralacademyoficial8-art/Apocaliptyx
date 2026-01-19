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
    const supabase = getSupabaseAdmin();

    // Get current user id if logged in
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();
      currentUserId = currentUser?.id || null;
    }

    // Get user profile
    const { data: user, error } = await supabase
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
        is_premium,
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

    // Get all stats in parallel for better performance
    const [
      followersResult,
      followingResult,
      followCheckResult,
      badgesResult,
      scenariosCreatedResult,
      stealsAsThiefResult,
      stealsAsVictimResult,
      scenariosWonResult,
      totalLossesResult,
      rankResult,
      totalUsersResult,
    ] = await Promise.all([
      // Followers count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id),

      // Following count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id),

      // Check if current user is following
      currentUserId && currentUserId !== user.id
        ? supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', user.id)
            .single()
        : Promise.resolve({ data: null }),

      // Badges
      supabase
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
        .limit(10),

      // Scenarios created
      supabase
        .from('scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id),

      // Steals as thief (successful steals)
      supabase
        .from('scenario_steal_history')
        .select('*', { count: 'exact', head: true })
        .eq('thief_id', user.id),

      // Steals as victim (times robbed)
      supabase
        .from('scenario_steal_history')
        .select('*', { count: 'exact', head: true })
        .eq('victim_id', user.id),

      // Scenarios won (pools won)
      supabase
        .from('scenario_pools')
        .select('*', { count: 'exact', head: true })
        .eq('winner_id', user.id),

      // Total losses from predictions
      supabase
        .from('predictions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'LOST'),

      // User rank based on XP
      supabase
        .from('users')
        .select('id')
        .order('experience', { ascending: false }),

      // Total users for percentile calculation
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
    ]);

    // Calculate rank
    const rankData = rankResult.data || [];
    const userRankIndex = rankData.findIndex((u: { id: string }) => u.id === user.id);
    const rank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

    // Calculate percentile (top X%)
    const totalUsers = totalUsersResult.count || 1;
    const percentile = rank > 0 ? Math.round((1 - (rank - 1) / totalUsers) * 100) : 0;

    // Calculate total losses
    const lossesData = totalLossesResult.data || [];
    const totalLosses = lossesData.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

    const isFollowing = !!followCheckResult.data;
    const badges = badgesResult.data || [];

    // Calculate XP to next level
    const xpToNextLevel = user.level * 1000;
    const accuracy = user.total_predictions > 0
      ? (user.correct_predictions / user.total_predictions * 100).toFixed(1)
      : 0;

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
      isPremium: user.is_premium || false,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      followersCount: followersResult.count || 0,
      followingCount: followingResult.count || 0,
      isFollowing,
      stats: {
        totalPredictions: user.total_predictions,
        correctPredictions: user.correct_predictions,
        accuracy: parseFloat(accuracy as string),
        totalEarnings: user.total_earnings,
        totalLosses,
        netProfit: user.total_earnings - totalLosses,
        scenariosCreated: scenariosCreatedResult.count || 0,
        scenariosWon: scenariosWonResult.count || 0,
        stealsSuccessful: stealsAsThiefResult.count || 0,
        stealsReceived: stealsAsVictimResult.count || 0,
        currentStreak: user.current_streak || 0,
        bestStreak: user.best_streak || 0,
        rank,
        percentile,
      },
      customization: {
        avatarFrame: null,
        profileTheme: 'default',
        entryEffect: null,
      },
      badges: badges.map((b: any) => ({
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

    // Validación de campos
    if (body.bio !== undefined && body.bio.length > 200) {
      return NextResponse.json({ error: 'La biografía no puede tener más de 200 caracteres' }, { status: 400 });
    }

    if (body.displayName !== undefined && !body.displayName.trim()) {
      return NextResponse.json({ error: 'El nombre no puede estar vacío' }, { status: 400 });
    }

    if (body.displayName !== undefined && body.displayName.length > 50) {
      return NextResponse.json({ error: 'El nombre no puede tener más de 50 caracteres' }, { status: 400 });
    }

    const allowedFields = ['display_name', 'bio', 'avatar_url', 'banner_url'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (body[camelField] !== undefined) {
        updates[field] = body[camelField];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 });
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
