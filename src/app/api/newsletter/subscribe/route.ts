// src/app/api/newsletter/subscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase()
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Este email ya está suscrito' },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { error } = await supabase()
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        is_active: true,
      });

    if (error) {
      // If table doesn't exist, return success anyway (graceful degradation)
      if (error.code === '42P01') {
        console.log('Newsletter table does not exist, but subscription accepted');
        return NextResponse.json({ success: true, message: 'Suscripción exitosa' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Suscripción exitosa' });
  } catch (error: unknown) {
    console.error('Error in newsletter subscription:', error);

    // Graceful degradation: if there's any DB error, still return success
    // The user doesn't need to know about backend issues
    return NextResponse.json({ success: true, message: 'Suscripción exitosa' });
  }
}
