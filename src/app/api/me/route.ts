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

    const supabase = getSupabaseAdmin();
    let { data: user, error } = await supabase
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
        is_premium,
        created_at
      `)
      .eq('email', session.user.email)
      .single();

    // Si el usuario no existe en la tabla users, crearlo automáticamente
    // Esto puede pasar si hubo un error durante el registro OAuth
    if (error?.code === 'PGRST116' || !user) {
      console.log('User not found in users table, creating profile for:', session.user.email);

      // Generar username único
      let baseUsername = session.user.email.split('@')[0] || 'user';
      baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
      let username = baseUsername;
      let attempts = 0;

      // Verificar si el username ya existe y generar uno único
      while (attempts < 5) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (!existingUser) break;

        // Si existe, añadir números aleatorios
        username = `${baseUsername}${Math.floor(Math.random() * 9999)}`;
        attempts++;
      }

      const displayName = session.user.name || username;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: session.user.email,
          username: username,
          display_name: displayName,
          avatar_url: session.user.image || null,
          role: 'USER',
          ap_coins: 1000, // Bonus de bienvenida para usuarios nuevos
          level: 1,
          experience: 0,
          is_verified: false,
          is_premium: false,
          is_banned: false,
          total_predictions: 0,
          correct_predictions: 0,
          total_earnings: 0,
        })
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
          is_premium,
          created_at
        `)
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user profile in /api/me:', insertError);
        return NextResponse.json({ error: 'Error al crear perfil de usuario' }, { status: 500 });
      }

      // Crear notificación de bienvenida
      await supabase.from('notifications').insert({
        user_id: newUser.id,
        type: 'welcome',
        title: '¡Bienvenido a Apocaliptyx! 🎉',
        message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
        link_url: '/explorar',
        is_read: false,
      });

      user = newUser;
    } else if (error) {
      console.error('Supabase error in /api/me:', error);
      return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
    }

    // Normalizar el rol a mayúsculas para consistencia
    const normalizedRole = (user.role || 'USER').toUpperCase();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: normalizedRole,
      apCoins: user.ap_coins,
      level: user.level,
      experience: user.experience,
      isVerified: user.is_verified,
      isPremium: user.is_premium,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({
      error: 'Error interno',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
