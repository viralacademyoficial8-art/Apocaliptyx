// src/app/api/admin/newsletter/export/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const { data } = await supabase()
    .from('users')
    .select('role')
    .eq('email', email)
    .single();

  return data?.role && ['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(data.role);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Get all active subscribers
    const { data: subscribers, error } = await supabase()
      .from('newsletter_subscribers')
      .select('email, subscribed_at, is_active, source')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty CSV
      if (error.code === '42P01') {
        const csv = 'email,subscribed_at,is_active,source\n';
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
          },
        });
      }
      throw error;
    }

    // Create CSV content
    const headers = ['email', 'subscribed_at', 'is_active', 'source'];
    const rows = (subscribers || []).map((sub) => [
      sub.email,
      sub.subscribed_at,
      sub.is_active ? 'true' : 'false',
      sub.source || 'footer',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/admin/newsletter/export:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
