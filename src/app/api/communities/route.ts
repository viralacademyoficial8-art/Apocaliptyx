import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

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
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'joined', 'popular', 'all'

    // Get user's joined communities first (needed for private community access)
    let userCommunities: string[] = [];
    if (session?.user?.id) {
      const { data: memberships } = await supabase()
        .from('community_members')
        .select('community_id')
        .eq('user_id', session.user.id)
        .eq('is_banned', false);

      userCommunities = (memberships as { community_id: string }[] | null)?.map(m => m.community_id) || [];
    }

    // Get all public communities
    let publicQuery = supabase()
      .from('communities')
      .select('*')
      .eq('is_public', true)
      .order('members_count', { ascending: false });

    if (search) {
      publicQuery = publicQuery.ilike('name', `%${search}%`);
    }

    const { data: publicCommunitiesRaw, error: publicError } = await publicQuery;

    if (publicError) throw publicError;

    let allCommunities = (publicCommunitiesRaw as CommunityRow[] | null) || [];

    // For authenticated users, also get private communities they are members of
    if (session?.user?.id && userCommunities.length > 0) {
      let privateQuery = supabase()
        .from('communities')
        .select('*')
        .eq('is_public', false)
        .in('id', userCommunities)
        .order('members_count', { ascending: false });

      if (search) {
        privateQuery = privateQuery.ilike('name', `%${search}%`);
      }

      const { data: privateCommunitiesRaw, error: privateError } = await privateQuery;

      if (!privateError && privateCommunitiesRaw) {
        // Merge private communities with public ones (avoiding duplicates)
        const privateComms = privateCommunitiesRaw as CommunityRow[];
        const existingIds = new Set(allCommunities.map(c => c.id));
        for (const privateCommunity of privateComms) {
          if (!existingIds.has(privateCommunity.id)) {
            allCommunities.push(privateCommunity);
          }
        }
      }
    }

    // Filter if needed
    let filteredCommunities = allCommunities;
    if (filter === 'joined' && session?.user?.id) {
      filteredCommunities = filteredCommunities.filter(c =>
        userCommunities.includes(c.id)
      );
    }

    // Get user's pending join requests for private communities
    let userRequests: Record<string, string> = {};
    if (session?.user?.id) {
      const { data: requests } = await supabase()
        .from('community_join_requests')
        .select('community_id, status')
        .eq('user_id', session.user.id);

      if (requests) {
        for (const req of requests as { community_id: string; status: string }[]) {
          userRequests[req.community_id] = req.status;
        }
      }
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
      requestStatus: userRequests[community.id] || null,
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
    const session = await auth();

    if (!session?.user?.id) {
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
    const { data: existing } = await supabase()
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
    const { data: community, error } = await supabase()
      .from('communities')
      .insert({
        name,
        slug,
        description,
        is_public: isPublic !== false,
        requires_approval: requiresApproval || false,
        categories: categories || [],
        theme_color: themeColor || '#6366f1',
        creator_id: session.user.id,
        members_count: 1,
        posts_count: 0,
      })
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
    const { error: memberError } = await supabase().from('community_members').insert({
      community_id: community.id,
      user_id: session.user.id,
      role: 'owner',
    });

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
