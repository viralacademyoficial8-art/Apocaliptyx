import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface UserData {
  id: string;
  level: number;
  xp: number;
  ap_coins: number;
  achievement_points: number;
  active_title_id?: string;
}

interface TitleDef {
  id: string;
  name: string;
  name_es: string;
  rarity: string;
}

interface UserTitle {
  title_id: string;
  title?: TitleDef;
}

// GET /api/gamification/profile - Get user's gamification profile
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get user with level
    const { data: userDataRaw, error: userError } = await supabase
      .from('users')
      .select('id, level, xp, ap_coins, achievement_points, active_title_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    const userData = userDataRaw as UserData;

    // Get user's rank based on level
    const { data: rank } = await supabase
      .from('user_ranks')
      .select('*')
      .lte('min_level', userData.level)
      .or(`max_level.gte.${userData.level},max_level.is.null`)
      .limit(1)
      .single();

    // Get user's streak
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's active title
    let activeTitle = null;
    if (userData.active_title_id) {
      const { data: title } = await supabase
        .from('title_definitions')
        .select('*')
        .eq('id', userData.active_title_id)
        .single();
      activeTitle = title;
    }

    // Get user's unlocked titles
    const { data: unlockedTitlesRaw } = await supabase
      .from('user_titles')
      .select('*, title:title_definitions(*)')
      .eq('user_id', user.id);

    const unlockedTitles = unlockedTitlesRaw as UserTitle[] | null;

    // Get all title definitions for showing locked ones
    const { data: allTitlesRaw } = await supabase
      .from('title_definitions')
      .select('*')
      .order('rarity');

    const allTitles = allTitlesRaw as TitleDef[] | null;

    return NextResponse.json({
      user: userData,
      rank,
      streak: streak || {
        current_login_streak: 0,
        longest_login_streak: 0,
        current_prediction_streak: 0,
        longest_prediction_streak: 0,
        current_correct_streak: 0,
        longest_correct_streak: 0,
        total_login_days: 0,
      },
      activeTitle,
      titles: allTitles?.map(title => ({
        ...title,
        isUnlocked: unlockedTitles?.some(ut => ut.title_id === title.id) || false,
        isActive: title.id === userData.active_title_id,
      })) || [],
    });
  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil de gamificación' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/profile - Update login streak
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Call the update_login_streak function
    const { data, error } = await supabase
      .rpc('update_login_streak' as never, { p_user_id: user.id } as never);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating login streak:', error);
    return NextResponse.json(
      { error: 'Error al actualizar racha' },
      { status: 500 }
    );
  }
}
