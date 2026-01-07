import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  banner_url?: string;
  theme_color?: string;
  is_public: boolean;
  is_verified: boolean;
  members_count: number;
  posts_count: number;
  categories?: string[];
}

// GET /api/communities - Get all communities
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'joined', 'popular', 'all'

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('communities')
      .select('*')
      .eq('is_public', true)
      .order('members_count', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: communitiesRaw, error } = await query;

    if (error) throw error;

    const communities = communitiesRaw as CommunityRow[] | null;

    // Get user's joined communities
    let userCommunities: string[] = [];
    if (user) {
      const { data: memberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)
        .eq('is_banned', false);

      userCommunities = (memberships as { community_id: string }[] | null)?.map(m => m.community_id) || [];
    }

    // Filter if needed
    let filteredCommunities = communities || [];
    if (filter === 'joined' && user) {
      filteredCommunities = filteredCommunities.filter(c =>
        userCommunities.includes(c.id)
      );
    }

    const result = filteredCommunities.map(community => ({
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      iconUrl: community.icon_url,
      bannerUrl: community.banner_url,
      themeColor: community.theme_color,
      isPublic: community.is_public,
      isVerified: community.is_verified,
      membersCount: community.members_count,
      postsCount: community.posts_count,
      categories: community.categories || [],
      isMember: userCommunities.includes(community.id),
    }));

    return NextResponse.json({ communities: result, userCommunities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Error al obtener comunidades' },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic, requiresApproval, categories, themeColor } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una comunidad con ese nombre' },
        { status: 400 }
      );
    }

    // Create community
    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name,
        slug,
        description,
        is_public: isPublic !== false,
        requires_approval: requiresApproval || false,
        categories: categories || [],
        theme_color: themeColor || '#6366f1',
        creator_id: user.id,
        members_count: 1,
        posts_count: 0,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating community:', error);
      return NextResponse.json(
        { error: error.message || 'Error al crear comunidad' },
        { status: 400 }
      );
    }

    // Add creator as owner
    const { error: memberError } = await supabase.from('community_members').insert({
      community_id: (community as { id: string }).id,
      user_id: user.id,
      role: 'owner',
    } as never);

    if (memberError) {
      console.error('Error adding owner to community:', memberError);
    }

    return NextResponse.json({
      success: true,
      community,
      message: 'Comunidad creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Error al crear comunidad' },
      { status: 500 }
    );
  }
}
