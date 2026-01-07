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
  requires_approval?: boolean;
  members_count: number;
  posts_count: number;
  rules?: string[];
  categories?: string[];
  created_at: string;
  creator_id: string;
}

// GET /api/communities/[id] - Get community by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Try to find by ID first, then by slug
    let query = supabase.from('communities').select('*');

    // Check if it's a UUID format (for ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: communityRaw, error } = await query.single();

    if (error || !communityRaw) {
      return NextResponse.json({ error: 'Comunidad no encontrada' }, { status: 404 });
    }

    const community = communityRaw as CommunityRow;

    // Check membership and role
    let isMember = false;
    let userRole: string | null = null;

    if (user) {
      const { data: membership } = await supabase
        .from('community_members')
        .select('role, is_banned')
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .single();

      if (membership && !(membership as any).is_banned) {
        isMember = true;
        userRole = (membership as any).role;
      }
    }

    // If private and not a member, don't show full details
    if (!community.is_public && !isMember) {
      return NextResponse.json({
        community: {
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          iconUrl: community.icon_url,
          bannerUrl: community.banner_url,
          themeColor: community.theme_color || '#6366f1',
          isPublic: false,
          isVerified: community.is_verified,
          membersCount: community.members_count,
          postsCount: 0,
          categories: [],
          rules: [],
          createdAt: community.created_at,
          creatorId: community.creator_id,
        },
        isMember: false,
        userRole: null,
      });
    }

    return NextResponse.json({
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        iconUrl: community.icon_url,
        bannerUrl: community.banner_url,
        themeColor: community.theme_color || '#6366f1',
        isPublic: community.is_public,
        isVerified: community.is_verified,
        requiresApproval: community.requires_approval || false,
        membersCount: community.members_count,
        postsCount: community.posts_count,
        rules: community.rules || [],
        categories: community.categories || [],
        createdAt: community.created_at,
        creatorId: community.creator_id,
      },
      isMember,
      userRole,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Error al obtener comunidad' },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id] - Update community
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes((membership as any).role)) {
      return NextResponse.json({ error: 'No tienes permisos para editar esta comunidad' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, iconUrl, bannerUrl, themeColor, isPublic, requiresApproval, rules, categories } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (iconUrl !== undefined) updates.icon_url = iconUrl;
    if (bannerUrl !== undefined) updates.banner_url = bannerUrl;
    if (themeColor !== undefined) updates.theme_color = themeColor;
    if (isPublic !== undefined) updates.is_public = isPublic;
    if (requiresApproval !== undefined) updates.requires_approval = requiresApproval;
    if (rules !== undefined) updates.rules = rules;
    if (categories !== undefined) updates.categories = categories;

    const { error } = await supabase
      .from('communities')
      .update(updates as never)
      .eq('id', communityId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comunidad actualizada' });
  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Error al actualizar comunidad' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id] - Delete community
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is owner
    const { data: membership } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (!membership || (membership as any).role !== 'owner') {
      return NextResponse.json({ error: 'Solo el propietario puede eliminar la comunidad' }, { status: 403 });
    }

    // Delete community (cascade will delete members and posts)
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comunidad eliminada' });
  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Error al eliminar comunidad' },
      { status: 500 }
    );
  }
}
