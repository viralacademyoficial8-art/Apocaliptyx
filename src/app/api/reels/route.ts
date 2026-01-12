import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cloudinaryService } from '@/services/cloudinary.service';

// Configuración de ruta para Next.js 14 App Router
export const maxDuration = 60; // 60 segundos de timeout para uploads de video
export const dynamic = 'force-dynamic';

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para publicar reels' }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('FormData error:', formError);
      return NextResponse.json({
        error: 'Error al procesar el archivo. El video puede ser demasiado grande (máx 100MB)'
      }, { status: 400 });
    }

    const videoFile = formData.get('video') as File;
    const caption = formData.get('caption') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');

    if (!videoFile) {
      return NextResponse.json({ error: 'Video requerido' }, { status: 400 });
    }

    // Verificar tamaño del archivo (máx 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({
        error: 'El video es demasiado grande. Máximo permitido: 100MB'
      }, { status: 400 });
    }

    let videoUrl: string;
    let thumbnailUrl: string | undefined;
    let duration: number | undefined;
    let width: number | undefined;
    let height: number | undefined;

    // Check if Cloudinary is configured
    if (cloudinaryService.isConfigured()) {
      try {
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
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return NextResponse.json({
          error: 'Error al subir video a Cloudinary. Intenta de nuevo.'
        }, { status: 500 });
      }
    } else {
      // Fallback to Supabase Storage if Cloudinary is not configured
      console.log('Cloudinary not configured, using Supabase Storage');

      try {
        const fileName = `${user.id}/${Date.now()}-${videoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('reels')
          .upload(fileName, videoFile);

        if (uploadError) {
          console.error('Supabase storage error:', uploadError);
          return NextResponse.json({
            error: 'Error al subir video. Verifica que el bucket de storage existe.'
          }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('reels')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      } catch (storageError) {
        console.error('Storage error:', storageError);
        return NextResponse.json({
          error: 'Error de almacenamiento. Contacta al administrador.'
        }, { status: 500 });
      }
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

    if (createError) {
      console.error('Database insert error:', createError);
      return NextResponse.json({
        error: 'Error al guardar el reel en la base de datos'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reel,
      message: 'Reel publicado exitosamente',
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear reel. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
