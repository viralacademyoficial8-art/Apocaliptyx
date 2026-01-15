import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// GET /api/forum/mentions?q=query - Search users for mentions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] });
    }

    // Search users by username
    const { data, error } = await supabase()
      .from('users')
      .select(`
        id,
        username,
        display_name,
        avatar_url
      `)
      .ilike('username', `${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json({ users: [] });
    }

    // Format response to match MentionSuggestion interface
    const users = (data || []).map((user: any) => ({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      badges: [], // We can add badges later if needed
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in mentions search:', error);
    return NextResponse.json({ users: [] });
  }
}
