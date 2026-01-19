import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/communities/upload-image - Upload community banner or icon
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'banner' or 'icon'
    const communityId = formData.get('communityId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!type || !['banner', 'icon'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de imagen inválido. Usa "banner" o "icon"' },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const maxSize = type === 'banner' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for banner, 5MB for icon
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `La imagen no puede superar ${type === 'banner' ? '10MB' : '5MB'}` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes' },
        { status: 400 }
      );
    }

    // If communityId is provided, verify user has permission
    if (communityId) {
      const { data: membership } = await supabase()
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', session.user.id)
        .single();

      if (!membership || !['owner', 'admin'].includes((membership as any).role)) {
        return NextResponse.json(
          { error: 'No tienes permisos para modificar esta comunidad' },
          { status: 403 }
        );
      }
    }

    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `community-${type}-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try uploading to community-images bucket first
    let uploadResult = await supabase().storage
      .from('community-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    // If community-images bucket doesn't exist, try forum-images
    if (uploadResult.error) {
      uploadResult = await supabase().storage
        .from('forum-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadResult.error) {
        // Try posts bucket as last resort
        uploadResult = await supabase().storage
          .from('posts')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadResult.error) {
          return NextResponse.json(
            { error: `Error al subir: ${uploadResult.error.message}` },
            { status: 400 }
          );
        }

        // Get public URL from posts bucket
        const { data: { publicUrl } } = supabase().storage
          .from('posts')
          .getPublicUrl(fileName);

        return NextResponse.json({
          success: true,
          url: publicUrl,
          type,
        });
      }

      // Get public URL from forum-images bucket
      const { data: { publicUrl } } = supabase().storage
        .from('forum-images')
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        type,
      });
    }

    // Get public URL from community-images bucket
    const { data: { publicUrl } } = supabase().storage
      .from('community-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type,
    });
  } catch (error) {
    console.error('Error uploading community image:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
