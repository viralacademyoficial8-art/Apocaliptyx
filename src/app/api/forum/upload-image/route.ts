import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

// POST /api/forum/upload-image - Upload image to storage
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen no puede superar 5MB' },
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

    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try uploading to forum-images bucket
    let uploadResult = await supabase().storage
      .from('forum-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    // If forum-images doesn't exist, try posts bucket
    if (uploadResult.error) {
      console.error('Upload to forum-images failed:', uploadResult.error);

      uploadResult = await supabase().storage
        .from('posts')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadResult.error) {
        console.error('Upload to posts failed:', uploadResult.error);
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
      });
    }

    // Get public URL from forum-images bucket
    const { data: { publicUrl } } = supabase().storage
      .from('forum-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
