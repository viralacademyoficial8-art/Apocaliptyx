import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ParticipationRow {
  tournament_id: string;
}

interface TournamentCategory {
  name?: string;
  name_es?: string;
  icon?: string;
}

interface TournamentRow {
  id: string;
  name: string;
  description?: string;
  banner_url?: string;
  tournament_type?: string;
  category_id?: string;
  entry_fee: number;
  prize_pool: number;
  max_participants?: number;
  participants_count: number;
  min_predictions?: number;
  start_date?: string;
  end_date?: string;
  status: string;
  prizes?: unknown[];
  category?: TournamentCategory;
}

// GET /api/tournaments - Get tournaments list
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'upcoming', 'active', 'ended', 'all'
    const search = searchParams.get('search');

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('prediction_tournaments')
      .select(`
        *,
        category:prediction_categories(name, name_es, icon)
      `)
      .order('start_date', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: tournamentsRaw, error } = await query;

    if (error) throw error;

    const tournaments = tournamentsRaw as TournamentRow[] | null;

    // Get user's joined tournaments
    let joinedTournamentIds: string[] = [];
    if (user) {
      const { data: participationsRaw } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', user.id);

      const participations = participationsRaw as ParticipationRow[] | null;
      joinedTournamentIds = participations?.map(p => p.tournament_id) || [];
    }

    const formattedTournaments = tournaments?.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      bannerUrl: tournament.banner_url,
      tournamentType: tournament.tournament_type,
      categoryId: tournament.category_id,
      categoryName: tournament.category?.name_es,
      categoryIcon: tournament.category?.icon,
      entryFee: tournament.entry_fee,
      prizePool: tournament.prize_pool,
      maxParticipants: tournament.max_participants,
      participantsCount: tournament.participants_count,
      minPredictions: tournament.min_predictions,
      startDate: tournament.start_date,
      endDate: tournament.end_date,
      status: tournament.status,
      prizes: tournament.prizes || [],
      isJoined: joinedTournamentIds.includes(tournament.id),
    })) || [];

    return NextResponse.json({ tournaments: formattedTournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Error al obtener torneos' },
      { status: 500 }
    );
  }
}
