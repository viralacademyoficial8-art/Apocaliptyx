// src/app/api/debug-session/route.ts
// Endpoint temporal para debugear la session

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No session',
        session: null
      });
    }

    // Obtener datos actuales de la BD
    const supabase = getSupabaseAdmin();
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, username, role, ap_coins')
      .ilike('email', session.user.email.toLowerCase())
      .single();

    return NextResponse.json({
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        username: session.user.username,
      },
      databaseUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        role: dbUser.role,
        ap_coins: dbUser.ap_coins,
      } : null,
      dbError: dbError?.message || null,
      roleMatch: session.user.role === dbUser?.role,
      problem: session.user.role !== dbUser?.role
        ? `Session has role "${session.user.role}" but DB has role "${dbUser?.role}". User needs to re-login.`
        : null,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
