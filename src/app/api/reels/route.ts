import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cloudinaryService } from '@/services/cloudinary.service';

interface UserFollow {
  following_id: string;
}

interface ReelUser {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface ReelRow {
  id: string;
  user_id: string;
  video_url?: string;
  thumbnail_url?: string;
  caption?: string;
  duration?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  tags?: string[];
  created_at: string;
  user?: ReelUser;
}

interface ReelLike {
  reel_id: string;
}

// GET /api/reels - Get reels feed
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'foryou', 'following', 'trending'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_reels')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filter === 'trending') {
      query = query.order('views_count', { ascending: false });
    }

    if (filter === 'following' && user) {
      // Get followed users
      const { data: followingRaw } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const following = followingRaw as UserFollow[] | null;
      const followingIds = following?.map(f => f.following_id) || [];

      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      }
    }

    const { data: reelsRaw, error } = await query;

    if (error) throw error;

    const reels = reelsRaw as ReelRow[] | null;

    // Get user's likes if logged in
    let likedReelIds: string[] = [];
    let bookmarkedReelIds: string[] = [];

    if (user && reels && reels.length > 0) {
      const reelIds = reels.map(r => r.id);

      const { data: likesRaw } = await supabase
        .from('reel_likes')
        .select('reel_id')
        .eq('user_id', user.id)
        .in('reel_id', reelIds);

      const likes = likesRaw as ReelLike[] | null;
      likedReelIds = likes?.map(l => l.reel_id) || [];

      // For bookmarks, we'd need a bookmarks table - using a placeholder for now
      bookmarkedReelIds = [];
    }

    const formattedReels = reels?.map(reel => ({
      id: reel.id,
      userId: reel.user_id,
      username: reel.user?.username,
      displayName: reel.user?.display_name,
      avatarUrl: reel.user?.avatar_url,
      videoUrl: reel.video_url,
      thumbnailUrl: reel.thumbnail_url,
      caption: reel.caption,
      duration: reel.duration,
      viewsCount: reel.views_count,
      likesCount: reel.likes_count,
      commentsCount: reel.comments_count,
      sharesCount: reel.shares_count,
      isLiked: likedReelIds.includes(reel.id),
      isBookmarked: bookmarkedReelIds.includes(reel.id),
      tags: reel.tags || [],
      createdAt: reel.created_at,
    })) || [];

    return NextResponse.json({ reels: formattedReels });
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { error: 'Error al obtener reels' },
      { status: 500 }
    );
  }
}

// POST /api/reels - Create a new reel
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const caption = formData.get('caption') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');

    if (!videoFile) {
      return NextResponse.json({ error: 'Video requerido' }, { status: 400 });
    }

    let videoUrl: string;
    let thumbnailUrl: string | undefined;
    let duration: number | undefined;
    let width: number | undefined;
    let height: number | undefined;

    // Check if Cloudinary is configured
    if (cloudinaryService.isConfigured()) {
      // Upload to Cloudinary
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await cloudinaryService.uploadVideo(buffer, {
        folder: `apocaliptyx/reels/${user.id}`,
        public_id: `reel-${Date.now()}`,
      });

      videoUrl = uploadResult.secure_url;
      thumbnailUrl = uploadResult.thumbnail_url;
      duration = uploadResult.duration;
      width = uploadResult.width;
      height = uploadResult.height;

      console.log('Video uploaded to Cloudinary:', uploadResult.public_id);
    } else {
      // Fallback to Supabase Storage if Cloudinary is not configured
      console.log('Cloudinary not configured, using Supabase Storage');

      const fileName = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      videoUrl = publicUrl;
    }

    // Create reel record
    const { data: reel, error: createError } = await supabase
      .from('user_reels')
      .insert({
        user_id: user.id,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        caption,
        duration,
        width,
        height,
        tags,
        is_published: true,
      } as never)
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      reel,
      message: 'Reel publicado exitosamente',
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { error: 'Error al crear reel' },
      { status: 500 }
    );
  }
}
