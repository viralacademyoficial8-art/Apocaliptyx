// src/app/api/profile/achievements/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const { data: currentUser } = await getSupabaseAdmin()
      .from('users')
      .select('id, total_predictions, correct_predictions, total_earnings, current_streak, best_streak')
      .eq('email', session.user.email)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await getSupabaseAdmin()
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (achievementsError) throw achievementsError;

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await getSupabaseAdmin()
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', currentUser.id);

    if (userError) throw userError;

    const unlockedMap = new Map(
      (userAchievements || []).map((ua: any) => [ua.achievement_id, ua.unlocked_at])
    );

    const achievements = (allAchievements || []).map((achievement: any) => {
      const isUnlocked = unlockedMap.has(achievement.id);
      const requirement = achievement.requirement || {};
      
      // Calculate progress based on requirement type
      let progress = 0;
      let maxProgress = requirement.count || 1;
      
      switch (requirement.type) {
        case 'predictions':
          progress = currentUser.total_predictions;
          break;
        case 'correct_predictions':
          progress = currentUser.correct_predictions;
          break;
        case 'earnings':
          progress = currentUser.total_earnings;
          break;
        case 'streak':
          progress = currentUser.best_streak;
          break;
        default:
          progress = isUnlocked ? maxProgress : 0;
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: getRarity(achievement.reward_coins),
        progress: Math.min(progress, maxProgress),
        maxProgress,
        isUnlocked,
        unlockedAt: unlockedMap.get(achievement.id) || null,
        rewardCoins: achievement.reward_coins,
        rewardXp: achievement.reward_xp,
      };
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRarity(rewardCoins: number): 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' {
  if (rewardCoins >= 5000) return 'LEGENDARY';
  if (rewardCoins >= 2000) return 'EPIC';
  if (rewardCoins >= 500) return 'RARE';
  return 'COMMON';
}
