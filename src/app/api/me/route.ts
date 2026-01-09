// src/app/api/me/route.ts
// Endpoint para obtener datos actualizados del usuario actual

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: user, error } = await getSupabaseAdmin()
      .from('users')
      .select(`
        id,
        username,
        email,
        display_name,
        avatar_url,
        role,
        ap_coins,
        level,
        experience,
        is_verified,
        is_premium
      `)
      .eq('email', session.user.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      apCoins: user.ap_coins,
      level: user.level,
      experience: user.experience,
      isVerified: user.is_verified,
      isPremium: user.is_premium,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
