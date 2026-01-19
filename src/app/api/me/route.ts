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

    // Normalizar el email a minúsculas para comparación case-insensitive
    const normalizedEmail = session.user.email.toLowerCase().trim();

    const supabase = getSupabaseAdmin();

    // Verificar que las variables de entorno están configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('[/api/me] Missing Supabase env vars - URL:', !!supabaseUrl, 'Key:', !!serviceKey);
      // Fallback: devolver datos básicos de la sesión
      return NextResponse.json({
        id: session.user.id || 'session-user',
        email: session.user.email,
        username: session.user.username || session.user.email?.split('@')[0] || 'user',
        displayName: session.user.name || session.user.username || 'Usuario',
        avatarUrl: session.user.image || '',
        role: (session.user.role || 'USER').toUpperCase(),
        apCoins: session.user.apCoins ?? 1000,
        level: session.user.level ?? 1,
        experience: 0,
        isVerified: session.user.isVerified ?? false,
        isPremium: session.user.isPremium ?? false,
        createdAt: session.user.createdAt || new Date().toISOString(),
      });
    }

    // Intentar buscar usuario - primero con búsqueda exacta, luego case-insensitive
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
      .ilike('email', normalizedEmail)
      .single();

    // Si no se encuentra con ilike, intentar con el email original (por si hay caracteres especiales)
    if ((error?.code === 'PGRST116' || !user) && session.user.email !== normalizedEmail) {
      const retryResult = await supabase
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

      if (retryResult.data) {
        user = retryResult.data;
        error = null;
      }
    }

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
          email: normalizedEmail,
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
        // Si el error es por duplicado (race condition), intentar buscar el usuario de nuevo
        if (insertError?.code === '23505' || insertError?.message?.includes('duplicate')) {
          console.log('Race condition detected, fetching existing user for:', normalizedEmail);

          const { data: existingUser, error: fetchError } = await supabase
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
            .ilike('email', normalizedEmail)
            .single();

          if (existingUser) {
            user = existingUser;
          } else {
            console.error('Error fetching user after race condition:', fetchError);
            // Fallback: devolver datos de sesión para no bloquear la UI
            return NextResponse.json({
              id: session.user.id || 'temp-user',
              email: session.user.email,
              username: session.user.username || session.user.email?.split('@')[0] || 'user',
              displayName: session.user.name || session.user.username || 'Usuario',
              avatarUrl: session.user.image || '',
              role: 'USER',
              apCoins: 1000,
              level: 1,
              experience: 0,
              isVerified: false,
              isPremium: false,
              createdAt: new Date().toISOString(),
              _fallback: true,
              _error: 'race_condition_fetch_failed'
            });
          }
        } else {
          // Log detallado del error para debugging
          console.error('Error creating user profile in /api/me:', {
            code: insertError?.code,
            message: insertError?.message,
            details: insertError?.details,
            hint: insertError?.hint,
            email: normalizedEmail,
            username: username
          });

          // Fallback: devolver datos de sesión para no bloquear la UI
          return NextResponse.json({
            id: session.user.id || 'temp-user',
            email: session.user.email,
            username: session.user.username || session.user.email?.split('@')[0] || 'user',
            displayName: session.user.name || session.user.username || 'Usuario',
            avatarUrl: session.user.image || '',
            role: 'USER',
            apCoins: 1000,
            level: 1,
            experience: 0,
            isVerified: false,
            isPremium: false,
            createdAt: new Date().toISOString(),
            _fallback: true,
            _error: insertError?.code || 'insert_failed',
            _errorMessage: insertError?.message
          });
        }
      } else {
        // Usuario creado exitosamente, crear notificación de bienvenida
        await supabase.from('notifications').insert({
          user_id: newUser.id,
          type: 'welcome',
          title: '¡Bienvenido a Apocaliptyx! 🎉',
          message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
          link_url: '/explorar',
          is_read: false,
        });

        user = newUser;
      }
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
