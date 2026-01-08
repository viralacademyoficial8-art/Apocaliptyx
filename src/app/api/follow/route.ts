// src/app/api/follow/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST - Seguir a un usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { followingId, followerUsername, followerAvatar } = body;

    // Usar el ID del usuario autenticado como followerId (seguridad)
    const followerId = session.user.id;

    // Validaciones
    if (!followingId) {
      return NextResponse.json(
        { success: false, error: 'Falta el ID del usuario a seguir' },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { success: false, error: 'No puedes seguirte a ti mismo' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verificar si ya lo sigue
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Ya sigues a este usuario' },
        { status: 400 }
      );
    }

    // Crear el follow
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      } as never);

    if (followError) {
      console.error('Error following user:', followError);
      return NextResponse.json(
        { success: false, error: followError.message },
        { status: 500 }
      );
    }

    // 🔔 Crear notificación para el usuario seguido
    await supabase
      .from('notifications')
      .insert({
        user_id: followingId,
        type: 'new_follower',
        title: 'Nuevo seguidor',
        message: `@${followerUsername || 'Alguien'} comenzó a seguirte.`,
        image_url: followerAvatar || null,
        link_url: `/perfil/${followerUsername}`,
        is_read: false,
      } as never);

    return NextResponse.json({ success: true, message: 'Ahora sigues a este usuario' });
  } catch (error) {
    console.error('Error in follow API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Dejar de seguir a un usuario
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');

    // Usar el ID del usuario autenticado como followerId (seguridad)
    const followerId = session.user.id;

    if (!followingId) {
      return NextResponse.json(
        { success: false, error: 'Falta el ID del usuario' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Dejaste de seguir a este usuario' });
  } catch (error) {
    console.error('Error in unfollow API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Verificar si sigue a un usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');

    // Usar el ID del usuario autenticado como followerId (seguridad)
    const followerId = session.user.id;

    if (!followingId) {
      return NextResponse.json(
        { success: false, error: 'Falta el ID del usuario' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return NextResponse.json({ 
      success: true, 
      isFollowing: !!data 
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}