import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface AchievementDef {
  id: string;
  name: string;
  name_es: string;
  description?: string;
  description_es?: string;
  category: string;
  icon: string;
  icon_locked?: string;
  color?: string;
  points: number;
  rarity: string;
  is_secret: boolean;
}

interface UserAchievement {
  achievement_id: string;
  progress?: number;
  progress_max?: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

// GET /api/gamification/achievements - Get user's achievements
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const { data: { user } } = await supabase.auth.getUser();

    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID requerido' }, { status: 400 });
    }

    // Get all achievement definitions
    const { data: achievementsRaw, error: achievementsError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('category')
      .order('points', { ascending: false });

    if (achievementsError) throw achievementsError;

    const achievements = achievementsRaw as AchievementDef[] | null;

    // Get user's unlocked achievements
    const { data: userAchievementsRaw, error: userError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', targetUserId);

    if (userError) throw userError;

    const userAchievements = userAchievementsRaw as UserAchievement[] | null;

    // Get user's achievement points
    const { data: userDataRaw } = await supabase
      .from('users')
      .select('achievement_points')
      .eq('id', targetUserId)
      .single();

    const userData = userDataRaw as { achievement_points?: number } | null;

    // Merge achievements with user progress
    const mergedAchievements = achievements?.map(achievement => {
      const userAchievement = userAchievements?.find(
        ua => ua.achievement_id === achievement.id
      );

      return {
        id: achievement.id,
        name: achievement.name,
        nameEs: achievement.name_es,
        description: achievement.description,
        descriptionEs: achievement.description_es,
        category: achievement.category,
        icon: achievement.icon,
        iconLocked: achievement.icon_locked,
        color: achievement.color,
        points: achievement.points,
        rarity: achievement.rarity,
        isSecret: achievement.is_secret,
        progress: userAchievement?.progress || 0,
        progressMax: userAchievement?.progress_max || 100,
        isUnlocked: userAchievement?.is_unlocked || false,
        unlockedAt: userAchievement?.unlocked_at,
      };
    }) || [];

    return NextResponse.json({
      achievements: mergedAchievements,
      totalPoints: userData?.achievement_points || 0,
      unlockedCount: userAchievements?.filter(ua => ua.is_unlocked).length || 0,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Error al obtener logros' },
      { status: 500 }
    );
  }
}
